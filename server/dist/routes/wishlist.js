"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
// Change to export a function that accepts db
exports.default = (db) => {
    const router = (0, express_1.Router)();
    // Get user's wishlist
    router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const wishlistQuery = `
    SELECT 
      w.*,
      p.name as product_name,
      p.slug as product_slug,
      p.price as product_price,
      p.compare_at_price,
      p.stock_quantity,
      p.rating,
      p.review_count,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt,
      c.name as category_name,
      c.slug as category_slug
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ? AND p.is_active = 1
    ORDER BY w.created_at DESC
  `;
        const wishlistItems = await db.all(wishlistQuery, [userId]);
        const formattedWishlist = wishlistItems.map((item) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            productSlug: item.product_slug,
            price: parseFloat(item.product_price),
            compareAtPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : null,
            stockQuantity: item.stock_quantity,
            rating: parseFloat(item.rating),
            reviewCount: item.review_count,
            primaryImage: item.primary_image,
            primaryImageAlt: item.primary_image_alt,
            category: {
                name: item.category_name,
                slug: item.category_slug
            },
            addedAt: item.created_at
        }));
        res.json({
            success: true,
            data: { wishlist: formattedWishlist }
        });
    }));
    // Add item to wishlist
    router.post('/', [
        (0, express_validator_1.body)('productId').isInt({ min: 1 })
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { productId } = req.body;
        // Check if product exists and is active
        const product = await db.get('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Check if item already exists in wishlist
        const existingItem = await db.get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existingItem) {
            return res.status(400).json({ error: 'Item already in wishlist' });
        }
        // Add to wishlist
        const result = await db.run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
        const wishlistItemId = result.lastID;
        res.status(201).json({
            success: true,
            message: 'Item added to wishlist',
            data: { id: wishlistItemId }
        });
    }));
    // Remove item from wishlist
    router.delete('/:productId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.params;
        const result = await db.run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Item not found in wishlist' });
        }
        res.json({
            success: true,
            message: 'Item removed from wishlist'
        });
    }));
    // Clear entire wishlist
    router.delete('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        await db.run('DELETE FROM wishlist WHERE user_id = ?', [userId]);
        res.json({
            success: true,
            message: 'Wishlist cleared'
        });
    }));
    // Check if product is in wishlist
    router.get('/check/:productId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.params;
        const item = await db.get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
        res.json({
            success: true,
            data: {
                inWishlist: !!item,
                wishlistItemId: item?.id || null
            }
        });
    }));
    // Move item from wishlist to cart
    router.post('/move-to-cart/:productId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity = 1 } = req.body;
        // Check if item is in wishlist
        const wishlistItem = await db.get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (!wishlistItem) {
            return res.status(404).json({ error: 'Item not found in wishlist' });
        }
        // Check if product exists and has stock
        const product = await db.get('SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = 1', [productId]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.stock_quantity < quantity) {
            return res.status(400).json({
                error: `Insufficient stock. Available: ${product.stock_quantity}`
            });
        }
        // Check if item already in cart
        const existingCartItem = await db.get('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existingCartItem) {
            // Update quantity in cart
            const newQuantity = existingCartItem.quantity + quantity;
            await db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, existingCartItem.id]);
        }
        else {
            // Add to cart
            await db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
        }
        // Remove from wishlist
        await db.run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
        res.json({
            success: true,
            message: 'Item moved to cart'
        });
    }));
    return router;
};
//# sourceMappingURL=wishlist.js.map