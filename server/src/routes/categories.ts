import { Router, Request, Response } from 'express';
import { Database } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Change to export a function that accepts db
export default (db: Database) => {
  const router = Router();

// Get all categories (hierarchical structure)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const categoriesQuery = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count,
      (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategory_count
    FROM categories c
    WHERE c.parent_id IS NULL AND c.is_active = 1
    ORDER BY c.sort_order ASC, c.name ASC
  `;

  const categories = await db.all(categoriesQuery);

  // Get subcategories for each category
  const formattedCategories = await Promise.all(
    categories.map(async (category: any) => {
      const subcategoriesQuery = `
        SELECT 
          sc.*,
          (SELECT COUNT(*) FROM products p WHERE p.category_id = sc.id AND p.is_active = 1) as product_count
        FROM categories sc
        WHERE sc.parent_id = ? AND sc.is_active = 1
        ORDER BY sc.sort_order ASC, sc.name ASC
      `;

      const subcategories = await db.all(subcategoriesQuery, [category.id]);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.image_url,
        productCount: category.product_count,
        subcategoryCount: category.subcategory_count,
        subcategories: subcategories.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          imageUrl: sub.image_url,
          productCount: sub.product_count
        }))
      };
    })
  );

  res.json({
    success: true,
    data: { categories: formattedCategories }
  });
}));

// Get single category by ID or slug with products
router.get('/:identifier', asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const { page = 1, limit = 12, sort = 'newest' } = req.query;

  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? 'c.id = ?' : 'c.slug = ?';

  const categoryQuery = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count,
      (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategory_count
    FROM categories c
    WHERE ${whereClause} AND c.is_active = 1
  `;

  const category = await db.get(categoryQuery, [identifier]);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Get subcategories
  const subcategoriesQuery = `
    SELECT 
      sc.*,
      (SELECT COUNT(*) FROM products p WHERE p.category_id = sc.id AND p.is_active = 1) as product_count
    FROM categories sc
    WHERE sc.parent_id = ? AND sc.is_active = 1
    ORDER BY sc.sort_order ASC, sc.name ASC
  `;

  const subcategories = await db.all(subcategoriesQuery, [category.id]);

  // Get products in this category with pagination
  const offset = (Number(page) - 1) * Number(limit);

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

  const productsQuery = `
    SELECT 
      p.*,
      pi.image_url as primary_image,
      pi.alt_text as primary_image_alt
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE p.category_id = ? AND p.is_active = 1
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const products = await db.all(productsQuery, [category.id, Number(limit), offset]);

  // Get total product count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    WHERE p.category_id = ? AND p.is_active = 1
  `;

  const countResult = await db.get(countQuery, [category.id]);
  const totalProducts = countResult?.total || 0;
  const totalPages = Math.ceil(totalProducts / Number(limit));

  const formattedCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.image_url,
    productCount: category.product_count,
    subcategoryCount: category.subcategory_count,
    subcategories: subcategories.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      imageUrl: sub.image_url,
      productCount: sub.product_count
    })),
    products: products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.short_description,
      price: parseFloat(product.price),
      compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      rating: parseFloat(product.rating),
      reviewCount: product.review_count,
      primaryImage: product.primary_image,
      primaryImageAlt: product.primary_image_alt
    })),
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalProducts,
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1
    }
  };

  res.json({
    success: true,
    data: { category: formattedCategory }
  });
}));

// Get category breadcrumbs
router.get('/:identifier/breadcrumbs', asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params;

  // Check if identifier is a number (ID) or string (slug)
  const isNumeric = /^\d+$/.test(identifier);
  const whereClause = isNumeric ? 'c.id = ?' : 'c.slug = ?';

  const categoryQuery = `
    SELECT c.*, 
      (SELECT name FROM categories WHERE id = c.parent_id) as parent_name,
      (SELECT slug FROM categories WHERE id = c.parent_id) as parent_slug
    FROM categories c
    WHERE ${whereClause} AND c.is_active = 1
  `;

  const category = await db.get(categoryQuery, [identifier]);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const breadcrumbs = [
    { name: 'Home', slug: '/' }
  ];

  if (category.parent_id) {
    breadcrumbs.push({
      name: category.parent_name,
      slug: `/categories/${category.parent_slug}`
    });
  }

  breadcrumbs.push({
    name: category.name,
    slug: `/categories/${category.slug}`
  });

  res.json({
    success: true,
    data: { breadcrumbs }
  });
}));

  return router;
};