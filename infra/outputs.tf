output "data_api_url" {
  description = "Reader Lambda Function URL — set as VITE_DATA_API_URL in the frontend build."
  value       = aws_lambda_function_url.reader.function_url
}

output "table_name" {
  value = aws_dynamodb_table.data.name
}

output "writer_function_name" {
  description = "Invoke manually to seed the table: aws lambda invoke --function-name <this> /dev/stdout"
  value       = aws_lambda_function.fn["writer"].function_name
}
