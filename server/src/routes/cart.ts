import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Database } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export default (db: Database) => {
  const router = Router();

  // 🔒 Protect ALL cart routes
  router.use(authMiddleware);

  router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const cartItems = await db.all(
      `SELECT ci.*, p.name, p.price, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    let subtotal = 0;

    const items = cartItems.map((item: any) => {
      const total = item.price * item.quantity;
      subtotal += total;

      return {
        id: item.id,
        productId: item.product_id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: Number(total.toFixed(2)),
      };
    });

    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          subtotal: Number(subtotal.toFixed(2)),
          shippingAmount: shipping,
          taxAmount: Number(tax.toFixed(2)),
          totalAmount: Number((subtotal + shipping + tax).toFixed(2)),
          itemCount: items.length,
          freeShippingThreshold: 100,
          eligibleForFreeShipping: subtotal >= 100,
        },
      },
    });
  }));

  router.post(
    '/',
    body('productId').isInt({ min: 1 }),
    body('quantity').optional().isInt({ min: 1, max: 10 }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.id;
      const { productId, quantity = 1 } = req.body;

      const product = await db.get(
        'SELECT id, price, stock_quantity FROM products WHERE id = ? AND is_active = 1',
        [productId]
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const existing = await db.get(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existing) {
        await db.run(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existing.quantity + quantity, existing.id]
        );
      } else {
        await db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
      }

      res.status(201).json({ success: true });
    })
  );

  return router;
};