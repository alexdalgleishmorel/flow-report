# infra — wave-report backend stack (Terraform)

The **deploy-once** serverless data pipeline that replaced the hourly
commit-data-to-git GitHub Action:

```
EventBridge rule (cron 0 * * * ?) ─▶ wave-report-writer ─▶ DynamoDB wave-report-data
SPA (GitHub Pages) ─GET─▶ wave-report-reader Function URL ─▶ DynamoDB
```

No API Gateway — the reader is a public Lambda **Function URL** (no per-request
charge, cheapest read path). One zip of `backend/src` backs both functions;
each selects its entrypoint via the `handler` string (`local.handlers`). No
build step: the handlers are plain `.mjs` using only the runtime-bundled AWS
SDK v3.

| Resource                   | Notes                                                       |
| -------------------------- | ----------------------------------------------------------- |
| `wave-report-data`         | DynamoDB, `PAY_PER_REQUEST`, PK `pk` ∈ FLOW/WEATHER/HISTORICAL |
| `wave-report-writer`       | Hourly via EventBridge rule `wave-report-hourly-fetch`      |
| `wave-report-reader`       | Function URL (`AuthType NONE` — public read-only data), CORS locked to the Pages origin |

The exec role gets item-level DynamoDB ops on exactly the data table arn; log
groups are explicit with 14-day retention. Same conventions as recipe's
`infra/shared` — flat root module, resources by concern, no child modules.

## Apply (manual)

State lives in the shared bootstrap bucket (created by recipe's
`infra/bootstrap`), under the key `wave-report/terraform.tfstate`.

```bash
cd infra

terraform init \
  -backend-config="bucket=<state bucket from bootstrap>" \
  -backend-config="dynamodb_table=<lock table>" \
  -backend-config="region=us-east-1"
terraform apply
```

Outputs:

- `data_api_url` — set as the GitHub Actions repo variable `VITE_DATA_API_URL`
  (and in `.env.local` for local dev).
- `writer_function_name` — invoke once after first apply to seed the table.

> No `.tfvars` — variables have working defaults; override with `TF_VAR_*` if needed.
