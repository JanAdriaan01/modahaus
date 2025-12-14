import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { Database } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

import authRoutesBuilder from './routes/auth';
import productRoutesBuilder from './routes/products';
import categoryRoutesBuilder from './routes/categories';
import orderRoutesBuilder from './routes/orders';
import userRoutesBuilder from './routes/users';
import wishlistRoutesBuilder from './routes/wishlist';
import cartRoutesBuilder from './routes/cart';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

/* =========================
   Trust Proxy (REQUIRED)
========================= */
app.set('trust proxy', 1);

// Initialize database
const db = new Database();

async function startServer() {
  try {
    await db.init();

    const authRoutes = authRoutesBuilder(db);
    const productRoutes = productRoutesBuilder(db);
    const categoryRoutes = categoryRoutesBuilder(db);
    const orderRoutes = orderRoutesBuilder(db);
    const userRoutes = userRoutesBuilder(db);
    const wishlistRoutes = wishlistRoutesBuilder(db);
    const cartRoutes = cartRoutesBuilder(db);

    /* =========================
       Security (Helmet)
    ========================= */

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            scriptSrc: ["'self'"],
            connectSrc: [
              "'self'",
              'http://localhost:5000',
              'http://localhost:5173',
              'https://www.modahaus.co.za',
              'https://modahausclient.vercel.app'
            ],
            frameAncestors: ["'self'"]
          }
        }
      })
    );

    /* =========================
       Rate Limiting
    ========================= */

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false
      })
    );

    /* =========================
       CORS (MULTI-ORIGIN SAFE)
    ========================= */

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.modahaus.co.za',
      'https://modahausclient.vercel.app'
    ];

    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('CORS not allowed'));
          }
        },
        credentials: true
      })
    );

    /* =========================
       Parsers & Compression
    ========================= */

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(compression());

    /* =========================
       Static Files
    ========================= */

    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    /* =========================
       Health Check
    ========================= */

    app.get('/api/health', (_req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Modahaus API'
      });
    });

    /* =========================
       Routes
    ========================= */

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);

    app.use('/api/orders', authMiddleware, orderRoutes);
    app.use('/api/users', authMiddleware, userRoutes);
    app.use('/api/wishlist', authMiddleware, wishlistRoutes);
    app.use('/api/cart', authMiddleware, cartRoutes);

    /* =========================
       404
    ========================= */

    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`🚀 Modahaus API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
