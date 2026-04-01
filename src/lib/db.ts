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

  if (!uri) {
    console.error('❌ CRITICAL: MONGODB_URI is missing in environment variables.');
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
      maxPoolSize: 10,
    };

    console.log('📡 Attempting MongoDB Connection...');
    cached.promise = mongoose.connect(uri, opts).then((m) => {
        console.log('✅ MongoDB Connected [Atlas Host]');
        return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
}

export default dbConnect;
