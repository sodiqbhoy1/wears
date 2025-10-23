import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('Missing MONGODB_URI or DATABASE_URL in environment');
}

// Cache the connection across lambda invocations
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Use the built-in unified topology
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
