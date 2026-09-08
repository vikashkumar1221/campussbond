import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { connectDB, onDbReady } from './config/db.js';
import { seedDemoDataIfEmpty } from './utils/seedDemoData.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import lostRoutes from './routes/lostRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Safety net: log (don't crash) on unexpected async errors so one bad
// request can never take the whole API server down.
process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled promise rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught exception:', err);
});

// Automatically ensure demo data exists whenever DB connects or reconnects
onDbReady(seedDemoDataIfEmpty);

const app = express();

// ---- Global middleware ----
app.use(cors()); // allow the mobile app to call the API
app.use(express.json());
app.use(morgan('dev')); // request logging in the console

// Request timeout safeguard: guarantee no request hangs indefinitely
app.use((req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ message: 'Request timed out on the server. Please try again.' });
    }
  }, 8000);
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

// Database availability check for API endpoints (fail-fast instead of freezing)
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is currently reconnecting. Please retry in a moment.',
    });
  }
  next();
});

// Serve uploaded images (lost & found photos, etc.)
app.use('/uploads', express.static(UPLOAD_DIR));

// ---- Health check ----
app.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';
  res.json({
    name: 'Campus Bond API',
    status: 'ok',
    database: dbState,
    time: new Date().toISOString(),
  });
});

// ---- Feature routes ----
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lostfound', lostRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/assistant', assistantRoutes);

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to the database, then start listening.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Campus Bond API running on http://localhost:${PORT}`);
  });
});
