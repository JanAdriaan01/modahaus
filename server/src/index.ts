import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { Database } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Import routes
import authRoutesBuilder from './routes/auth';
import productRoutesBuilder from './routes/products';
import categoryRoutesBuilder from './routes/categories'; // Renamed import
import orderRoutesBuilder from './routes/orders';
import userRoutesBuilder from './routes/users';
import wishlistRoutesBuilder from './routes/wishlist';
import cartRoutesBuilder from './routes/cart';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const db = new Database();

async function startServer() {
  try {
    await db.init(); // Await database initialization

    // Initialize routes with the db instance
    const authRoutes = authRoutesBuilder(db);
    const productRoutes = productRoutesBuilder(db);
    const categoryRoutes = categoryRoutesBuilder(db);
    const orderRoutes = orderRoutesBuilder(db);
    const userRoutes = userRoutesBuilder(db);
    const wishlistRoutes = wishlistRoutesBuilder(db);
    const cartRoutes = cartRoutesBuilder(db);

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"]
        }
      }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    app.use(limiter);

    // CORS configuration
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }));

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    app.use(compression());

    // Serve static files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Modahaus E-commerce API'
      });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/orders', authMiddleware, orderRoutes);
    app.use('/api/users', authMiddleware, userRoutes);
    app.use('/api/wishlist', authMiddleware, wishlistRoutes);
    app.use('/api/cart', authMiddleware, cartRoutes);

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });

    // Global error handler
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`🚀 Modahaus Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit if server fails to start
  }
}

startServer(); // Call the async function to start the server

export default app;