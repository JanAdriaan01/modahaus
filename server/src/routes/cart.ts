import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Database } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Change to export a function that accepts db
export default (db: Database) => {
  const router = Router();

// Get user's cart
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const cartQuery = `
    SELECT 
      ci.*,
      p.name as product_name,
      p.slug as product_slug,
      p.price as product_price,
      p.compare_at_price,
      p.stock_quantity,
      p.sku as product_sku,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt,
      c.name as category_name,
      c.slug as category_slug
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ci.user_id = ? AND p.is_active = 1
    ORDER BY ci.updated_at DESC
  `;

  const cartItems = await db.all(cartQuery, [userId]);

  let subtotal = 0;
  const formattedCartItems = cartItems.map((item: any) => {
    const itemTotal = item.product_price * item.quantity;
    subtotal += itemTotal;

    return {
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug,
      productSku: item.product_sku,
      price: parseFloat(item.product_price),
      compareAtPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : null,
      stockQuantity: item.stock_quantity,
      quantity: item.quantity,
      totalPrice: parseFloat(itemTotal.toFixed(2)),
      primaryImage: item.primary_image,
      primaryImageAlt: item.primary_image_alt,
      category: {
        name: item.category_name,
        slug: item.category_slug
      },
      updatedAt: item.updated_at
    };
  });

  // Calculate shipping and totals
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;
  const taxAmount = subtotal * 0.08; // 8% tax
  const totalAmount = subtotal + shippingAmount + taxAmount;

  const cartSummary = {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingAmount: parseFloat(shippingAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    itemCount: cartItems.length,
    freeShippingThreshold: 100,
    eligibleForFreeShipping: subtotal >= 100
  };

  res.json({
    success: true,
    data: {
      items: formattedCartItems,
      summary: cartSummary
    }
  });
}));

// Add item to cart
router.post('/', [
  body('productId').isInt({ min: 1 }),
  body('quantity').optional().isInt({ min: 1, max: 10 })
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user!.id;
  const { productId, quantity = 1 } = req.body;

  // Check if product exists and is active
  const product = await db.get(
    'SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = 1',
    [productId]
  );

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock_quantity < quantity) {
    return res.status(400).json({ 
      error: `Insufficient stock. Available: ${product.stock_quantity}` 
    });
  }

  // Check if item already in cart
  const existingCartItem = await db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingCartItem) {
    // Update quantity
    const newQuantity = existingCartItem.quantity + quantity;
    
    if (newQuantity > product.stock_quantity) {
      return res.status(400).json({ 
        error: `Cannot add more items. Stock limit: ${product.stock_quantity}` 
      });
    }

    await db.run(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, existingCartItem.id]
    );

    res.json({
      success: true,
      message: 'Cart item quantity updated',
      data: { 
        productId,
        quantity: newQuantity,
        totalPrice: (product.price * newQuantity).toFixed(2)
      }
    });
  } else {
    // Add new item to cart
    const result = await db.run(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, productId, quantity]
    );

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: { 
        cartItemId: result.lastID,
        productId,
        quantity,
        totalPrice: (product.price * quantity).toFixed(2)
      }
    });
  }
}));

// Update cart item quantity
router.put('/:itemId', [
  body('quantity').isInt({ min: 1, max: 10 })
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user!.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Verify cart item belongs to user
  const cartItem = await db.get(
    'SELECT ci.*, p.stock_quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?',
    [itemId, userId]
  );

  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  if (cartItem.stock_quantity < quantity) {
    return res.status(400).json({ 
      error: `Insufficient stock. Available: ${cartItem.stock_quantity}` 
    });
  }

  await db.run(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [quantity, itemId, userId]
  );

  const totalPrice = (cartItem.price * quantity).toFixed(2);

  res.json({
    success: true,
    message: 'Cart item quantity updated',
    data: {
      itemId,
      quantity,
      totalPrice
    }
  });
}));

// Remove item from cart
router.delete('/:itemId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  const result = await db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({
    success: true,
    message: 'Item removed from cart'
  });
}));

// Clear entire cart
router.delete('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  res.json({
    success: true,
    message: 'Cart cleared'
  });
}));

// Move item from cart to wishlist
router.post('/move-to-wishlist/:itemId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  // Get cart item
  const cartItem = await db.get(
    'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );

  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  // Check if product already in wishlist
  const existingWishlistItem = await db.get(
    'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, cartItem.product_id]
  );

  if (existingWishlistItem) {
    return res.status(400).json({ error: 'Item already in wishlist' });
  }

  // Add to wishlist
  await db.run(
    'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [userId, cartItem.product_id]
  );

  // Remove from cart
  await db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );

  res.json({
    success: true,
    message: 'Item moved to wishlist'
  });
}));

// Validate cart (check stock and prices)
router.post('/validate', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const cartItems = await db.all(`
    SELECT ci.*, p.name, p.price, p.stock_quantity
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND p.is_active = 1
  `, [userId]);

  const validationResults = [];
  let hasChanges = false;

  for (const item of cartItems) {
    let status = 'valid';
    let message = '';
    let currentPrice = item.price;
    let availableStock = item.stock_quantity;

    // Check if product is still active
    if (!item) {
      status = 'removed';
      message = 'Product no longer available';
    }
    // Check stock
    else if (availableStock < item.quantity) {
      status = 'out_of_stock';
      message = `Only ${availableStock} items available`;
      hasChanges = true;
    }
    // Check price changes (simplified - in real app you'd track price history)
    // This is just a placeholder for price validation logic

    validationResults.push({
      itemId: item.id,
      productId: item.product_id,
      status,
      message,
      currentPrice,
      availableStock,
      requestedQuantity: item.quantity
    });
  }

  if (hasChanges) {
    return res.status(400).json({
      success: false,
      error: 'Cart validation failed',
      data: { validationResults }
    });
  }

  res.json({
    success: true,
    message: 'Cart is valid',
    data: { validationResults }
  });
}));

  return router;
};