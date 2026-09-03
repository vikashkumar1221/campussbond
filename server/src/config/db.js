import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the URI in the environment.
 * If local MongoDB is not running or URI is not set, falls back
 * to an in-memory MongoDB instance for local testing/development.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (err) {
      console.warn(`⚠️ Could not connect to configured MONGO_URI (${err.message}). Falling back to local development database...`);
    }
  }

  // Fallback for seamless local development: start in-memory MongoDB
  try {
    console.log('⚡ Starting in-memory MongoDB for local development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ Local development MongoDB ready: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}
