// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import userRoutes from './users';

const router = Router();

// Health check for API routes
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    routes: ['auth', 'products', 'users']
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);

export default router;