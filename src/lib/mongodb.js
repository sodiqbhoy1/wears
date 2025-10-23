import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = global._mongoClient || null;

export async function getMongoClient() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error('Missing MONGODB_URI environment variable');
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  global._mongoClient = cachedClient;
  return client;
}

export async function getDb(dbName) {
  const client = await getMongoClient()
  return client.db(dbName)
}
