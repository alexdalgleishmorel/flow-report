// Writer Lambda — replaces the hourly GitHub Action data fetch + commit.
// Triggered by EventBridge Scheduler (cron: 0 * * * *). Fetches the three
// sources and writes each into DynamoDB. A source that returns invalid JSON is
// skipped, leaving the previously stored value intact (no overwrite).

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { fetchFlow, fetchWeather, fetchHistorical } from './fetchers.mjs';

const TABLE = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

async function store(pk, payload) {
  if (payload == null) return { pk, written: false };
  await ddb.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: {
        pk: { S: pk },
        payload: { S: payload },
        updatedAt: { S: new Date().toISOString() },
      },
    })
  );
  return { pk, written: true };
}

export async function handler() {
  // Fetch all three concurrently; one failure must not block the others.
  const [flow, weather, historical] = await Promise.allSettled([
    fetchFlow(),
    fetchWeather(),
    fetchHistorical(),
  ]);

  const valueOf = (r) => (r.status === 'fulfilled' ? r.value : null);

  const results = await Promise.all([
    store('FLOW', valueOf(flow)),
    store('WEATHER', valueOf(weather)),
    store('HISTORICAL', valueOf(historical)),
  ]);

  console.log('writer results', JSON.stringify(results));
  return results;
}
