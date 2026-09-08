import mongoose from 'mongoose';

// Prevent Mongoose from buffering queries indefinitely when connection drops
mongoose.set('bufferTimeoutMS', 3500);

let mongodInstance = null;
let isConnecting = false;
let heartbeatInterval = null;
const reconnectCallbacks = new Set();

/** Register a callback to execute after DB is (re)connected */
export function onDbReady(cb) {
  if (typeof cb === 'function') {
    reconnectCallbacks.add(cb);
  }
}

async function notifyDbReady() {
  for (const cb of reconnectCallbacks) {
    try {
      await cb();
    } catch (err) {
      console.error('⚠️ Error in DB ready callback:', err.message);
    }
  }
}

/**
 * Connect to MongoDB using the URI in the environment or in-memory fallback.
 */
export async function connectDB() {
  if (isConnecting) return;
  isConnecting = true;

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      isConnecting = false;
      startHeartbeat();
      await notifyDbReady();
      return;
    } catch (err) {
      console.warn(`⚠️ Could not connect to configured MONGO_URI (${err.message}). Falling back to local development database...`);
    }
  }

  // Fallback for seamless local development: start in-memory MongoDB
  try {
    if (mongodInstance) {
      try {
        await mongodInstance.stop();
      } catch (_) {}
      mongodInstance = null;
    }

    console.log('⚡ Starting in-memory MongoDB for local development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    console.log(`✅ Local development MongoDB ready: ${conn.connection.host}/${conn.connection.name}`);
    startHeartbeat();
    await notifyDbReady();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  } finally {
    isConnecting = false;
  }
}

/** Safely reconnect if the connection becomes stale or is lost */
export async function reconnectDB() {
  if (isConnecting) return;
  console.log('🔄 Reconnecting MongoDB...');
  try {
    await mongoose.disconnect();
  } catch (_) {}
  await connectDB();
}

/**
 * Periodically verify that database is responsive.
 * Detects silently stalled sockets (e.g. after laptop sleeps and wakes up).
 */
function startHeartbeat() {
  if (heartbeatInterval) return;

  heartbeatInterval = setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        // Test ping with 2.5s timeout
        await Promise.race([
          mongoose.connection.db?.admin()?.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 2500)),
        ]);
      } catch (err) {
        console.warn(`⚠️ Database ping failed (${err.message}). Self-healing triggered...`);
        await reconnectDB();
      }
    } else if (mongoose.connection.readyState === 0 && !isConnecting) {
      console.warn('⚠️ Database disconnected. Self-healing triggered...');
      await reconnectDB();
    }
  }, 10000);

  heartbeatInterval.unref?.();
}

// Clean up child processes on shutdown so no zombie processes remain
function handleShutdown() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (mongodInstance) {
    mongodInstance.stop().catch(() => {});
  }
}

process.once('SIGINT', () => {
  handleShutdown();
  process.exit(0);
});
process.once('SIGTERM', () => {
  handleShutdown();
  process.exit(0);
});

