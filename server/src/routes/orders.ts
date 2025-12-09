import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Database } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Change to export a function that accepts db
export default (db: Database) => {
  const router = Router();

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MDH-${timestamp}${random}`;
};

// Create new order
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isInt(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shippingAddress').isObject(),
  body('billingAddress').isObject(),
  body('paymentMethod').isIn(['card', 'paypal', 'bank_transfer']),
  body('shippingMethod').isString()
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { items, shippingAddress, billingAddress, paymentMethod, shippingMethod } = req.body;
  const userId = req.user!.id;

  // Validate products and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await db.get(
      'SELECT id, name, price, stock_quantity, sku FROM products WHERE id = ? AND is_active = 1',
      [item.productId]
    );

    if (!product) {
      return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
    }

    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` 
      });
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: itemTotal
    });
  }

  // Calculate shipping (free shipping over $100, otherwise $9.99)
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;
  const taxAmount = subtotal * 0.08; // 8% tax
  const totalAmount = subtotal + shippingAmount + taxAmount;

  // Create order
  const orderNumber = generateOrderNumber();
  const orderResult = await db.run(`
    INSERT INTO orders (
      user_id, order_number, subtotal, tax_amount, shipping_amount, 
      total_amount, billing_address, shipping_address, shipping_method,
      payment_method, status, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId, orderNumber, subtotal, taxAmount, shippingAmount,
    totalAmount, JSON.stringify(billingAddress), JSON.stringify(shippingAddress),
    shippingMethod, paymentMethod, 'pending', 'pending'
  ]);

  const orderId = orderResult.lastID;

  // Create order items
  for (const item of orderItems) {
    await db.run(`
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, item.productId, item.productName, item.productSku,
      item.quantity, item.unitPrice, item.totalPrice
    ]);

    // Update product stock
    await db.run(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [item.quantity, item.productId]
    );
  }

  // Clear user's cart
  await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  // Get the created order with items
  const order = await db.get(`
    SELECT * FROM orders WHERE id = ?
  `, [orderId]);

  const orderItems_query = await db.all(`
    SELECT * FROM order_items WHERE order_id = ?
  `, [orderId]);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        shippingAmount: parseFloat(order.shipping_amount),
        totalAmount: parseFloat(order.total_amount),
        createdAt: order.created_at,
        items: orderItems_query.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price)
        }))
      }
    }
  });
}));

// Get user's orders
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user!.id;
  const offset = (Number(page) - 1) * Number(limit);

  // Get orders with pagination
  const ordersQuery = `
    SELECT 
      o.*,
      COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const orders = await db.all(ordersQuery, [userId, Number(limit), offset]);

  // Get total count for pagination
  const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
  const countResult = await db.get(countQuery, [userId]);
  const totalOrders = countResult?.total || 0;
  const totalPages = Math.ceil(totalOrders / Number(limit));

  const formattedOrders = orders.map((order: any) => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    subtotal: parseFloat(order.subtotal),
    taxAmount: parseFloat(order.tax_amount),
    shippingAmount: parseFloat(order.shipping_amount),
    totalAmount: parseFloat(order.total_amount),
    itemCount: order.item_count,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }));

  res.json({
    success: true,
    data: {
      orders: formattedOrders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalOrders,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    }
  });
}));

// Get single order details
router.get('/:orderId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!.id;

  const order = await db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const orderItems = await db.all(
    'SELECT * FROM order_items WHERE order_id = ?',
    [orderId]
  );

  const formattedOrder = {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    subtotal: parseFloat(order.subtotal),
    taxAmount: parseFloat(order.tax_amount),
    shippingAmount: parseFloat(order.shipping_amount),
    discountAmount: parseFloat(order.discount_amount || 0),
    totalAmount: parseFloat(order.total_amount),
    currency: order.currency,
    billingAddress: JSON.parse(order.billing_address),
    shippingAddress: JSON.parse(order.shipping_address),
    shippingMethod: order.shipping_method,
    trackingNumber: order.tracking_number,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: orderItems.map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      productSku: item.product_sku,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price)
    }))
  };

  res.json({
    success: true,
    data: { order: formattedOrder }
  });
}));

// Track order by order number (public endpoint)
router.get('/track/:orderNumber', asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;

  const order = await db.get(
    'SELECT * FROM orders WHERE order_number = ?',
    [orderNumber]
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Return limited order info for tracking
  const trackingInfo = {
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    trackingNumber: order.tracking_number,
    shippingMethod: order.shipping_method,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };

  res.json({
    success: true,
    data: { order: trackingInfo }
  });
}));

// Update order status (admin only - would need admin middleware)
router.patch('/:orderId/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status, trackingNumber } = req.body;
  const userId = req.user!.id;

  // Check if user is admin (you'd implement admin middleware)
  if (!req.user!.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const updateFields = [];
  const updateValues = [];

  if (status) {
    updateFields.push('status = ?');
    updateValues.push(status);
  }

  if (trackingNumber !== undefined) {
    updateFields.push('tracking_number = ?');
    updateValues.push(trackingNumber);
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(orderId);

  await db.run(
    `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updatedOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

  res.json({
    success: true,
    message: 'Order updated successfully',
    data: { order: updatedOrder }
  });
}));

  return router;
};