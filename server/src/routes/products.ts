// src/routes/products.ts
import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all products with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('featured').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const featured = req.query.featured === 'true';

    let whereConditions = ['p.is_active = true'];
    let params: any[] = [];
    let paramCount = 0;

    // Add category filter
    if (category) {
      paramCount++;
      whereConditions.push(`c.slug = $${paramCount}`);
      params.push(category);
    }

    // Add search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Add featured filter
    if (featured) {
      whereConditions.push('p.is_featured = true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ${whereClause}
    `;
    const countResult = await database.get(countQuery, params);
    const total = parseInt(countResult.total);

    // Get products
    const productsQuery = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.short_description, 
        p.sku, p.price, p.compare_at_price, p.stock_quantity, 
        p.category_id, p.brand, p.rating, p.review_count, 
        p.is_featured, p.is_active, p.created_at,
        c.name as category_name, c.slug as category_slug,
        pi.image_url as primary_image
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      ${whereClause}
      ORDER BY p.created_at DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    const products = await database.all(productsQuery, params);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get product details
    const product = await database.get(`
      SELECT 
        p.*, c.name as category_name, c.slug as category_slug
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Get product images
    const images = await database.all(`
      SELECT id, image_url, alt_text, is_primary, sort_order
      FROM product_images 
      WHERE product_id = $1 
      ORDER BY sort_order ASC, is_primary DESC
    `, [product.id]);

    res.json({
      success: true,
      data: {
        ...product,
        images
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name, slug, description, shortDescription, sku, price,
      compareAtPrice, costPrice, stockQuantity, lowStockThreshold,
      categoryId, brand, weight, dimensions, color, size, material,
      isFeatured, isActive, metaTitle, metaDescription
    } = req.body;

    // Check if slug already exists
    const existingProduct = await database.get('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existingProduct) {
      return res.status(409).json({
        error: 'Product slug already exists'
      });
    }

    // Check if SKU already exists
    const existingSku = await database.get('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existingSku) {
      return res.status(409).json({
        error: 'Product SKU already exists'
      });
    }

    // Create product
    const result = await database.run(`
      INSERT INTO products (
        name, slug, description, short_description, sku, price,
        compare_at_price, cost_price, stock_quantity, low_stock_threshold,
        category_id, brand, weight, dimensions, color, size, material,
        is_featured, is_active, meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id
    `, [
      name, slug, description, shortDescription, sku, price,
      compareAtPrice, costPrice, stockQuantity, lowStockThreshold,
      categoryId, brand, weight, dimensions, color, size, material,
      isFeatured, isActive, metaTitle, metaDescription
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.lastID
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await database.all(`
      SELECT 
        id, name, slug, description, parent_id, image_url,
        is_active, sort_order, created_at, updated_at
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

export default router;