# ===================================================================================================
# wave-report backend stack. Replaces the hourly GitHub-Action-commits-data pipeline:
#
#   EventBridge rule (cron 0 * * * ?) ─▶ writer Lambda ─▶ DynamoDB (wave-report-data, on-demand)
#   SPA (GitHub Pages) ─GET─▶ reader Lambda Function URL ─▶ DynamoDB
#
# No API Gateway — the reader is exposed via a Lambda Function URL (no per-request charge, the
# cheapest read path). Both functions share one zip of backend/src and select their entrypoint via
# the `handler` string, keyed off local.handlers (same pattern as recipe's infra/shared).
# ===================================================================================================

# --- DynamoDB -------------------------------------------------------------------------------------
# Single table, three items (pk = FLOW | WEATHER | HISTORICAL), each holding one source's raw JSON
# payload (~31 KB total). On-demand: traffic is ~720 writes + low reads per month, zero idle cost.
resource "aws_dynamodb_table" "data" {
  name         = "wave-report-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }
}

# --- Lambda packaging -----------------------------------------------------------------------------
# A single zip over backend/src. The handlers are plain .mjs using only the runtime-bundled AWS SDK
# v3, so there is no build step or vendoring — the source dir zips as-is.
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.lambda_src_dir
  output_path = "${path.module}/.build/lambda.zip"
}

# --- Lambda execution role ------------------------------------------------------------------------
resource "aws_iam_role" "lambda" {
  name = "wave-report-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# CloudWatch Logs (create log group + put events) for both functions.
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Item-level ops on exactly the data table arn — writer puts, reader batch-gets.
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "wave-report-data-access"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:BatchGetItem",
      ]
      Resource = aws_dynamodb_table.data.arn
    }]
  })
}

# --- Lambdas --------------------------------------------------------------------------------------
locals {
  lambda_env = {
    TABLE_NAME = aws_dynamodb_table.data.name
  }

  # Map of logical function name -> handler entrypoint ("<module>.<function>").
  handlers = {
    writer = "writer.handler"
    reader = "reader.handler"
  }

  # Per-function resource overrides. The writer's budget covers the slow TransAlta fetch (the old
  # workflow allowed curl --max-time 600 with retries); the reader stays lean.
  function_config = {
    writer = { timeout = 660, memory_size = 256 }
    reader = { timeout = 10, memory_size = 128 }
  }
}

resource "aws_lambda_function" "fn" {
  for_each         = local.handlers
  function_name    = "wave-report-${each.key}"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"] # Graviton — cheaper per GB-second than x86
  handler          = each.value
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = local.function_config[each.key].timeout
  memory_size      = local.function_config[each.key].memory_size

  environment {
    variables = local.lambda_env
  }
}

# Explicit log group per function so retention is managed (and the group exists before first invoke).
resource "aws_cloudwatch_log_group" "fn" {
  for_each          = local.handlers
  name              = "/aws/lambda/${aws_lambda_function.fn[each.key].function_name}"
  retention_in_days = 14
}

# --- Hourly schedule (writer) ---------------------------------------------------------------------
# Same cadence as the old GitHub Action (cron: '0 * * * *'), top of every hour UTC.
resource "aws_cloudwatch_event_rule" "hourly" {
  name                = "wave-report-hourly-fetch"
  schedule_expression = "cron(0 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "writer" {
  rule = aws_cloudwatch_event_rule.hourly.name
  arn  = aws_lambda_function.fn["writer"].arn
}

resource "aws_lambda_permission" "events_invoke_writer" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn["writer"].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.hourly.arn
}

# --- Function URL (reader) ------------------------------------------------------------------------
# Public read-only endpoint for the SPA. AuthType NONE is intentional: the data is public river/
# weather info, and a Function URL has no per-request charge (vs API Gateway's per-million pricing).
resource "aws_lambda_function_url" "reader" {
  function_name      = aws_lambda_function.fn["reader"].function_name
  authorization_type = "NONE"

  cors {
    allow_origins = var.cors_allowed_origins
    allow_methods = ["GET"]
  }
}

# AuthType NONE only skips signing — public invocation still requires an explicit resource-based
# policy, or the URL returns 403. Since Oct 2025 AWS requires BOTH InvokeFunctionUrl and
# InvokeFunction in the policy for public URL access (one aws_lambda_permission per action).
resource "aws_lambda_permission" "public_invoke_reader_url" {
  statement_id           = "AllowPublicFunctionUrlInvoke"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.fn["reader"].function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

# No FunctionUrlAuthType condition here — the API only supports it on InvokeFunctionUrl. The wider
# grant is acceptable: the reader serves public read-only river data and touches nothing else.
resource "aws_lambda_permission" "public_invoke_reader" {
  statement_id  = "AllowPublicInvokeViaFunctionUrl"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn["reader"].function_name
  principal     = "*"
}
