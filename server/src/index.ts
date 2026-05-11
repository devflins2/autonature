import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import mediaRoutes from './routes/mediaRoutes';
import videoRoutes from './routes/videoRoutes';
import postRoutes from './routes/postRoutes';
import songRoutes from './routes/songRoutes';
import logRoutes from './routes/logRoutes';
import statsRoutes from './routes/statsRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import { initScheduler } from './services/schedulerService';
import { cleanupOldTempFiles } from './services/videoService';

const app = express();
const PORT = process.env.HF_SPACE === 'true' ? 7860 : (process.env.PORT || 5000);

// Startup: clean stale temp files from previous runs
cleanupOldTempFiles();

// Init Automation Scheduler
initScheduler();

// --- CUSTOM SECURITY FIREWALL ---
const requestTracker = new Map<string, { count: number, lastRequest: number }>();

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const track = requestTracker.get(ip) || { count: 0, lastRequest: now };

  if (now - track.lastRequest > 60000) {
    track.count = 0;
    track.lastRequest = now;
  }

  track.count++;
  requestTracker.set(ip, track);

  if (track.count > 100) { // Limit to 100 requests per minute
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  next();
};

app.use(rateLimiter);
app.use(cors());
app.use(express.json());
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

// Extra Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Security Middleware for all API calls
app.use('/api', authMiddleware);

// Routes
app.use('/api/media', mediaRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autopost';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- UNIFIED DEPLOYMENT LOGIC (Serve Frontend) ---
const isProduction = process.env.NODE_ENV === 'production' || process.env.HF_SPACE === 'true';

if (isProduction) {
  // Hugging Face ya Production mein client/dist ko serve karein
  const clientPath = path.join(process.cwd(), '../client/dist');
  app.use(express.static(clientPath));

  app.get('*', (req, res) => {
    // API routes ko skip karke baki sab frontend pe bhej dein
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientPath, 'index.html'));
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('Flora Backend Secure Engine is running (Development Mode)!');
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Flora Engine running on port ${PORT}!`);
  if (isProduction) {
    console.log(`   Mode:      Production (Unified)`);
    console.log(`   URL:       http://localhost:${PORT}`);
  } else {
    console.log(`   Mode:      Development`);
    console.log(`   API:       http://localhost:${PORT}/api`);
    console.log(`   Dashboard: http://localhost:5173 (Vite)`);
  }
});

