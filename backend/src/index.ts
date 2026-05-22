import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import registrationRoutes from './routes/registrations';
import adminRoutes from './routes/admin';
import geocodeRoutes from './routes/geocode';
import { testConnection } from './models/db';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 50,
  message: { error: 'Too many registration attempts from this IP.' },
});

app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/register', registrationLimiter, registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geocode', geocodeRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────
const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();

export default app;
