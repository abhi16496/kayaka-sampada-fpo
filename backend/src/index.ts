import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import registrationRoutes from './routes/registrations';
import adminRoutes from './routes/admin';
import geocodeRoutes from './routes/geocode';
import { testConnection } from './models/db';

const app = express();
const PORT = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 5000);

// ─── Trust proxy (required when running behind Coolify/nginx reverse proxy) ──
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());

// Build allowed origins list from env var (comma-separated) plus always allow localhost
const rawOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and OPTIONS preflight
    if (!origin) return callback(null, true);
    // Check against configured origins
    if (rawOrigins.some(allowed => origin === allowed)) return callback(null, true);
    // Allow any sslip.io or nip.io subdomain (used by Coolify public URLs)
    if (/^https?:\/\/[^.]+\.\d+\.\d+\.\d+\.\d+\.(sslip|nip)\.io$/.test(origin)) return callback(null, true);
    // Allow localhost on any port
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
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
  message: { error: 'Too many registration attempts from this IP. Please try again later.' },
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
