"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
// Change to export a function that accepts db
exports.default = (db) => {
    const router = (0, express_1.Router)();
    // Get all products with filtering, sorting, and pagination
    router.get('/', [
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
        (0, express_validator_1.query)('category').optional().isString(),
        (0, express_validator_1.query)('minPrice').optional().isFloat({ min: 0 }),
        (0, express_validator_1.query)('maxPrice').optional().isFloat({ min: 0 }),
        (0, express_validator_1.query)('brand').optional().isString(),
        (0, express_validator_1.query)('sort').optional().isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest']),
        (0, express_validator_1.query)('search').optional().isString()
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = 1, limit = 12, category, minPrice, maxPrice, brand, sort = 'newest', search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        // Build WHERE clause
        let whereClause = 'WHERE p.is_active = 1';
        const params = [];
        if (category) {
            whereClause += ' AND p.category_id = ?';
            params.push(category);
        }
        if (minPrice) {
            whereClause += ' AND p.price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            whereClause += ' AND p.price <= ?';
            params.push(maxPrice);
        }
        if (brand) {
            whereClause += ' AND p.brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        // Build ORDER BY clause
        let orderClause = 'ORDER BY p.created_at DESC';
        switch (sort) {
            case 'price_asc':
                orderClause = 'ORDER BY p.price ASC';
                break;
            case 'price_desc':
                orderClause = 'ORDER BY p.price DESC';
                break;
            case 'name_asc':
                orderClause = 'ORDER BY p.name ASC';
                break;
            case 'name_desc':
                orderClause = 'ORDER BY p.name DESC';
                break;
            case 'rating_desc':
                orderClause = 'ORDER BY p.rating DESC';
                break;
            case 'newest':
                orderClause = 'ORDER BY p.created_at DESC';
                break;
        }
        // Get total count
        const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    ${whereClause}
  `;
        const countResult = await db.get(countQuery, params);
        const totalProducts = countResult?.total || 0;
        const totalPages = Math.ceil(totalProducts / Number(limit));
        // Get products with primary images
        const productsQuery = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;
        const products = await db.all(productsQuery, [...params, Number(limit), offset]);
        // Format products
        const formattedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.short_description,
            sku: product.sku,
            price: parseFloat(product.price),
            compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
            stockQuantity: product.stock_quantity,
            category: {
                id: product.category_id,
                name: product.category_name,
                slug: product.category_slug
            },
            brand: product.brand,
            color: product.color,
            size: product.size,
            material: product.material,
            rating: parseFloat(product.rating),
            reviewCount: product.review_count,
            isFeatured: product.is_featured === 1,
            primaryImage: product.primary_image,
            primaryImageAlt: product.primary_image_alt
        }));
        res.json({
            success: true,
            data: {
                products: formattedProducts,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }
        });
    }));
    // Get featured products
    router.get('/featured', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { limit = 8 } = req.query;
        const productsQuery = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE p.is_featured = 1 AND p.is_active = 1
    ORDER BY p.created_at DESC
    LIMIT ?
  `;
        const products = await db.all(productsQuery, [Number(limit)]);
        const formattedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            shortDescription: product.short_description,
            price: parseFloat(product.price),
            compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
            category: {
                id: product.category_id,
                name: product.category_name,
                slug: product.category_slug
            },
            rating: parseFloat(product.rating),
            reviewCount: product.review_count,
            primaryImage: product.primary_image,
            primaryImageAlt: product.primary_image_alt
        }));
        res.json({
            success: true,
            data: { products: formattedProducts }
        });
    }));
    // Get single product by ID or slug
    router.get('/:identifier', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { identifier } = req.params;
        // Check if identifier is a number (ID) or string (slug)
        const isNumeric = /^\d+$/.test(identifier);
        const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';
        const productQuery = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      c.id as category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${whereClause} AND p.is_active = 1
  `;
        const product = await db.get(productQuery, [identifier]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Get product images
        const imagesQuery = `
    SELECT image_url, alt_text, is_primary, sort_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order ASC, is_primary DESC
  `;
        const images = await db.all(imagesQuery, [product.id]);
        // Get product reviews (limit to 10 for performance)
        const reviewsQuery = `
    SELECT 
      r.*,
      u.first_name,
      u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ? AND r.is_approved = 1
    ORDER BY r.created_at DESC
    LIMIT 10
  `;
        const reviews = await db.all(reviewsQuery, [product.id]);
        // Get related products (same category, exclude current product)
        const relatedQuery = `
    SELECT 
      p.*,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
    ORDER BY p.rating DESC, p.created_at DESC
    LIMIT 4
  `;
        const relatedProducts = await db.all(relatedQuery, [product.category_id, product.id]);
        const formattedProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.short_description,
            sku: product.sku,
            price: parseFloat(product.price),
            compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
            costPrice: product.cost_price ? parseFloat(product.cost_price) : null,
            stockQuantity: product.stock_quantity,
            lowStockThreshold: product.low_stock_threshold,
            category: {
                id: product.category_id,
                name: product.category_name,
                slug: product.category_slug
            },
            brand: product.brand,
            weight: product.weight,
            dimensions: product.dimensions,
            color: product.color,
            size: product.size,
            material: product.material,
            rating: parseFloat(product.rating),
            reviewCount: product.review_count,
            isFeatured: product.is_featured === 1,
            metaTitle: product.meta_title,
            metaDescription: product.meta_description,
            images: images.map((img) => ({
                url: img.image_url,
                alt: img.alt_text,
                isPrimary: img.is_primary === 1,
                sortOrder: img.sort_order
            })),
            reviews: reviews.map((review) => ({
                id: review.id,
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                author: `${review.first_name} ${review.last_name.charAt(0)}.`,
                isVerifiedPurchase: review.is_verified_purchase === 1,
                createdAt: review.created_at
            })),
            relatedProducts: relatedProducts.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: parseFloat(p.price),
                primaryImage: p.primary_image,
                primaryImageAlt: p.primary_image_alt
            }))
        };
        res.json({
            success: true,
            data: { product: formattedProduct }
        });
    }));
    return router;
};
//# sourceMappingURL=products.js.map