import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import buyerRequirementRoutes from './routes/buyerRequirementRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import frameRoutes from './routes/frameRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const framesStaticDir = path.resolve(__dirname, '../../client/public/frames');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: true, // Allow frontend dev server
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter for authentication & OTP routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requirements', buyerRequirementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/frames', frameRoutes);

// Static frames directory serving
app.use('/frames', express.static(framesStaticDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AgriTrade Hub AI',
    sihCode: 'SIH26033',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root API
app.get('/', (req, res) => {
  res.json({
    name: 'AgriTrade Hub AI API',
    tagline: 'From Farm to Market. One Intelligent Platform.',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[AgriTrade Hub Server] Running on http://localhost:${PORT}`);
  console.log(`[Environment] Node ${process.version} - Mode: ${process.env.NODE_ENV || 'development'}`);
});
