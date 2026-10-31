// apps/api/test-mongo.js  (ESM)
// Usage:  node test-mongo.js
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { MongoClient } from 'mongodb';

config({ path: resolve(process.cwd(), '../../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in ../../.env');
  process.exit(1);
}

const masked = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
console.log('Attempting:', masked);
console.log('Timeout: 5000ms');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const start = Date.now();

try {
  await client.connect();
  console.log(`CONNECTED in ${Date.now() - start}ms`);
  const dbs = await client.db().admin().listDatabases();
  console.log('Databases visible:', dbs.databases.map((d) => d.name).join(', '));
  await client.close();
  process.exit(0);
} catch (err) {
  console.error(`FAILED after ${Date.now() - start}ms`);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  process.exit(1);
}