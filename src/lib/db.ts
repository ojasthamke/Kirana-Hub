import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null };
}

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Mongoose | null> {
  const uri = MONGODB_URI?.trim();

  // If no MongoDB URI, we skip connection (allowing Supabase-only mode)
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found. Skipping MongoDB connection.');
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(uri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    cached.promise = null;
    cached.conn = null;
    // We don't throw here to allow building even if DB is down
  }

  return cached.conn;
}

export default dbConnect;
