// Reader Lambda — invoked directly via a Lambda Function URL (no API Gateway,
// zero per-request charge). Returns all three datasets in a single response so
// the SPA makes one request per load.
//
// Response contract preserves the frontend's expectations exactly:
//   flow       -> parsed JSON object (consumed as an object)
//   weather    -> parsed JSON object (consumed as an object)
//   historical -> JSON string (frontend calls JSON.parse on it). The source is
//     double-encoded — rivers.alberta.ca returns a JSON *string literal* whose
//     content is the records JSON. The old pipeline parsed twice (once at JSON
//     import, once in dataContext); here JSON.parse unwraps the outer literal
//     and the frontend's single JSON.parse does the rest.

import { DynamoDBClient, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';

const TABLE = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

export async function handler() {
  const out = await ddb.send(
    new BatchGetItemCommand({
      RequestItems: {
        [TABLE]: {
          Keys: [{ pk: { S: 'FLOW' } }, { pk: { S: 'WEATHER' } }, { pk: { S: 'HISTORICAL' } }],
        },
      },
    })
  );

  const payloads = {};
  for (const item of out.Responses?.[TABLE] ?? []) {
    payloads[item.pk.S] = item.payload?.S ?? null;
  }

  const body = JSON.stringify({
    flow: payloads.FLOW ? JSON.parse(payloads.FLOW) : null,
    weather: payloads.WEATHER ? JSON.parse(payloads.WEATHER) : null,
    historical: payloads.HISTORICAL ? JSON.parse(payloads.HISTORICAL) : null, // unwraps to a string, parsed client-side
  });

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      // Data only changes hourly — let browsers/CDN cache so reads stay cheap.
      'cache-control': 'public, max-age=600',
    },
    body,
  };
}
