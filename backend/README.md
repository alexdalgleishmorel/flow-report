# wave-report backend

Replaces the hourly **GitHub Action → git commit → full rebuild** data pipeline
with a serverless one:

```
EventBridge Scheduler (cron 0 * * * *)
        │
        ▼
  Writer Lambda ──fetch 3 sources──▶ DynamoDB (WaveReport, on-demand)
                                          │
   SPA (GitHub Pages) ─GET─▶ Reader Lambda Function URL ─▶ DynamoDB
```

No API Gateway — the reader uses a **Lambda Function URL** (no per-request
charge, the cheapest read path). Data lives in DynamoDB, so a data refresh no
longer triggers a site rebuild/redeploy.

## Components

| Piece                | What it does                                                            |
| -------------------- | ----------------------------------------------------------------------- |
| `wave-report-data`   | DynamoDB, on-demand. 3 items: `FLOW`, `WEATHER`, `HISTORICAL`.           |
| `wave-report-writer` | Hourly. Ports the workflow's 3 fetchers (incl. rivers.ab.ca CSRF flow). |
| `wave-report-reader` | Function URL. Returns all 3 datasets in one JSON response.              |

`src/fetchers.mjs` preserves the workflow's behavior exactly, including the
"valid-JSON-or-keep-previous" guard and the `rivers.alberta.ca` anti-forgery
token handshake. Uses only the AWS SDK v3 bundled in the Lambda runtime — no
`npm install` or build step; `infra/` zips this directory as-is.

## Response contract (do not change without updating the SPA)

```jsonc
{
  "flow":       { /* parsed object */ },
  "weather":    { /* parsed object */ },
  "historical": "[{...}]"   // RAW JSON string — the SPA calls JSON.parse() on it
}
```

## Deploy

Infrastructure is Terraform in [`infra/`](../infra/README.md) — see that README
for init/apply. There is no build step here; `infra/` zips `src/` directly.

Seed the table once and verify before cutting over:

```bash
aws lambda invoke --function-name "$(terraform -chdir=infra output -raw writer_function_name)" /dev/stdout
curl -s "$(terraform -chdir=infra output -raw data_api_url)" | jq 'keys'   # -> ["flow","historical","weather"]
```

Spot-check the reader output matches the current committed JSON shapes.

## Cost

At this app's traffic, effectively **\$0 / within free tiers**: ~720 writer
invocations/month and low read volume sit inside the Lambda free tier; Function
URLs have no per-request charge; DynamoDB on-demand on ~31 KB is pennies.
