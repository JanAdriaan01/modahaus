// src/scripts/seedDatabase.ts
import { Database } from '../config/database';

const db = new Database();

const sampleCategories = [
  // Main categories
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Beautiful and functional furniture for every room',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
    sort_order: 1
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Transform your space with stylish decorative items',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    sort_order: 2
  },
  {
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Everything you need for cooking and dining',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
    sort_order: 3
  },
  {
    name: 'Bedding & Bath',
    slug: 'bedding-bath',
    description: 'Comfort and style for your bedroom and bathroom',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=500&h=300&fit=crop',
    sort_order: 4
  },

  // Furniture subcategories
  {
    name: 'Living Room',
    slug: 'living-room',
    description: 'Sofas, chairs, and living room essentials',
    parent_id: 1,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    sort_order: 1
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    description: 'Beds, nightstands, and bedroom furniture',
    parent_id: 1,
    image_url: 'https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=400&h=300&fit=crop',
    sort_order: 2
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    description: 'Dining tables, chairs, and storage',
    parent_id: 1,
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    sort_order: 3
  },

  // Home Decor subcategories
  {
    name: 'Wall Art & Mirrors',
    slug: 'wall-art-mirrors',
    description: 'Artwork, mirrors, and wall decorations',
    parent_id: 2,
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    sort_order: 1
  },
  {
    name: 'Lighting',
    slug: 'lighting',
    description: 'Table lamps, floor lamps, and ceiling lights',
    parent_id: 2,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    sort_order: 2
  },
  {
    name: 'Rugs & Carpets',
    slug: 'rugs-carpets',
    description: 'Area rugs, runners, and floor coverings',
    parent_id: 2,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    sort_order: 3
  },

  // Kitchen & Dining subcategories
  {
    name: 'Cookware',
    slug: 'cookware',
    description: 'Pots, pans, and cooking utensils',
    parent_id: 3,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    sort_order: 1
  },
  {
    name: 'Dinnerware',
    slug: 'dinnerware',
    description: 'Plates, bowls, glasses, and cutlery',
    parent_id: 3,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    sort_order: 2
  },
  {
    name: 'Storage & Organization',
    slug: 'storage-organization',
    description: 'Kitchen storage and organization solutions',
    parent_id: 3,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    sort_order: 3
  }
];

const sampleProducts = [
  // Living Room Furniture
  {
    name: 'Modern Sectional Sofa',
    slug: 'modern    description: '-sectional-sofa',
Comfortable and stylish sectional sofa perfect for modern living rooms. Upholstered in premium fabric with sturdy hardwood frame construction.',
    short_description: 'Comfortable sectional sofa with premium fabric upholstery',
    sku: 'MS-SOFA-001',
    price: 1299.99,
    compare_at_price: 1599.99,
    stock_quantity: 15,
    category_id: 5, // Living Room
    brand: 'Modahaus',
    weight: 85.5,
    dimensions: '240cm W x 200cm D x 85cm H',
    color: 'Charcoal Gray',
    material: 'Fabric, Hardwood Frame',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Modern Sectional Sofa', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt: 'Sectional Sofa Detail', is_primary: false }
    ]
  },
  {
    name: 'Mid-Century Armchair',
    slug: 'mid-century-armchair',
    description: 'Classic mid-century modern armchair with tapered wooden legs and comfortable cushions. Perfect accent piece for any room.',
    short_description: 'Classic mid-century chair with wooden legs',
    sku: 'MC-CHAIR-001',
    price: 499.99,
    compare_at_price: null,
    stock_quantity: 25,
    category_id: 5, // Living Room
    brand: 'Modahaus',
    weight: 18.2,
    dimensions: '75cm W x 80cm D x 85cm H',
    color: 'Walnut Brown',
    material: 'Fabric, Walnut Wood',
    is_featured: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', alt: 'Mid-Century Armchair', is_primary: true }
    ]
  },
  {
    name: 'Glass Coffee Table',
    slug: 'glass-coffee-table',
    description: 'Elegant tempered glass coffee table with sleek metal frame. Creates an open, airy feel in any living space.',
    short_description: 'Tempered glass coffee table with metal frame',
    sku: 'GC-TABLE-001',
    price: 299.99,
    compare_at_price: 399.99,
    stock_quantity: 20,
    category_id: 5, // Living Room
    brand: 'Modahaus',
    weight: 22.5,
    dimensions: '120cm L x 60cm W x 45cm H',
    color: 'Clear/Black',
    material: 'Tempered Glass, Steel',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop', alt: 'Glass Coffee Table', is_primary: true }
    ]
  },

  // Bedroom Furniture
  {
    name: 'Queen Platform Bed',
    slug: 'queen-platform-bed',
    description: 'Minimalist queen platform bed with solid wood construction. No box spring required. Clean lines and modern design.',
    short_description: 'Minimalist queen platform bed',
    sku: 'QB-PLATFORM-001',
    price: 899.99,
    compare_at_price: 1199.99,
    stock_quantity: 12,
    category_id: 6, // Bedroom
    brand: 'Modahaus',
    weight: 65.0,
    dimensions: '160cm W x 210cm L x 35cm H',
    color: 'Natural Oak',
    material: 'Solid Oak Wood',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=600&h=600&fit=crop', alt: 'Queen Platform Bed', is_primary: true }
    ]
  },
  {
    name: 'Walnut Nightstand',
    slug: 'walnut-nightstand',
    description: 'Elegant walnut nightstand with drawer and shelf storage. Perfect complement to any bedroom decor.',
    short_description: 'Walnut nightstand with storage',
    sku: 'WN-STAND-001',
    price: 249.99,
    compare_at_price: null,
    stock_quantity: 30,
    category_id: 6, // Bedroom
    brand: 'Modahaus',
    weight: 12.5,
    dimensions: '50cm W x 40cm D x 60cm H',
    color: 'Walnut',
    material: 'Walnut Wood',
    is_featured: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=600&h=600&fit=crop', alt: 'Walnut Nightstand', is_primary: true }
    ]
  },

  // Dining Room Furniture
  {
    name: 'Extendable Dining Table',
    slug: 'extendable-dining-table',
    description: 'Beautiful extendable dining table that seats up to 8 people. Crafted from solid wood with smooth extension mechanism.',
    short_description: 'Extendable solid wood dining table',
    sku: 'ED-TABLE-001',
    price: 1199.99,
    compare_at_price: 1499.99,
    stock_quantity: 8,
    category_id: 7, // Dining Room
    brand: 'Modahaus',
    weight: 45.0,
    dimensions: '180cm L x 90cm W x 75cm H (extendable to 240cm)',
    color: 'Natural Oak',
    material: 'Solid Oak Wood',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop', alt: 'Extendable Dining Table', is_primary: true }
    ]
  },
  {
    name: 'Set of 6 Dining Chairs',
    slug: 'dining-chairs-set',
    description: 'Comfortable upholstered dining chairs with wooden legs. Set of 6 chairs perfect for your dining table.',
    short_description: 'Set of 6 upholstered dining chairs',
    sku: 'DC-CHAIR-006',
    price: 599.99,
    compare_at_price: null,
    stock_quantity: 15,
    category_id: 7, // Dining Room
    brand: 'Modahaus',
    weight: 8.5,
    dimensions: '45cm W x 55cm D x 85cm H',
    color: 'Gray Fabric/Walnut',
    material: 'Fabric, Walnut Wood',
    is_featured: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop', alt: 'Dining Chairs', is_primary: true }
    ]
  },

  // Home Decor - Lighting
  {
    name: 'Modern Floor Lamp',
    slug: 'modern-floor-lamp',
    description: 'Sleek modern floor lamp with adjustable height and dimmable LED bulb. Perfect for reading nooks and living rooms.',
    short_description: 'Adjustable dimmable floor lamp',
    sku: 'MF-LAMP-001',
    price: 189.99,
    compare_at_price: 249.99,
    stock_quantity: 40,
    category_id: 9, // Lighting
    brand: 'Modahaus',
    weight: 4.2,
    dimensions: '150cm H x 30cm W base',
    color: 'Matte Black',
    material: 'Metal, Fabric Shade',
    is_featured: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', alt: 'Modern Floor Lamp', is_primary: true }
    ]
  },
  {
    name: 'Table Lamp Set',
    slug: 'table-lamp-set',
    description: 'Beautiful set of 2 matching table lamps. Features fabric shades and wooden bases for coordinated lighting.',
    short_description: 'Set of 2 table lamps',
    sku: 'TL-LAMP-002',
    price: 129.99,
    compare_at_price: 179.99,
    stock_quantity: 25,
    category_id: 9, // Lighting
    brand: 'Modahaus',
    weight: 2.1,
    dimensions: '35cm H x 20cm W',
    color: 'White',
    material: 'Ceramic, Fabric',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', alt: 'Table Lamp Set', is_primary: true }
    ]
  },

  // Home Decor - Rugs
  {
    name: 'Persian Area Rug',
    slug: 'persian-area-rug',
    description: 'Hand-woven Persian-style area rug with traditional patterns. Adds warmth and elegance to any room.',
    short_description: 'Hand-woven Persian area rug',
    sku: 'PA-RUG-001',
    price: 399.99,
    compare_at_price: 599.99,
    stock_quantity: 12,
    category_id: 10, // Rugs & Carpets
    brand: 'Modahaus',
    weight: 8.5,
    dimensions: '200cm L x 300cm W',
    color: 'Red',
    material: 'Wool Blend',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Persian Area Rug', is_primary: true }
    ]
  },

  // Kitchen & Dining - Cookware
  {
    name: 'Stainless Steel Cookware Set',
    slug: 'stainless-steel-cookware-set',
    description: 'Professional-grade 10-piece stainless steel cookware set. Includes pots, pans, and utensils for all your cooking needs.',
    short_description: '10-piece stainless steel cookware set',
    sku: 'SC-SET-010',
    price: 299.99,
    compare_at_price: 449.99,
    stock_quantity: 20,
    category_id: 11, // Cookware
    brand: 'Modahaus',
    weight: 6.8,
    dimensions: 'Various sizes included',
    color: 'Stainless Steel',
    material: 'Stainless Steel',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop', alt: 'Stainless Steel Cookware Set', is_primary: true }
    ]
  },

  // Kitchen & Dining - Dinnerware
  {
    name: 'Porcelain Dinnerware Set',
    slug: 'porcelain-dinnerware-set',
    description: 'Elegant 16-piece porcelain dinnerware set. Perfect for everyday dining or special occasions. Microwave and dishwasher safe.',
    short_description: '16-piece porcelain dinnerware set',
    sku: 'PD-SET-016',
    price: 149.99,
    compare_at_price: 199.99,
    stock_quantity: 35,
    category_id: 12, // Dinnerware
    brand: 'Modahaus',
    weight: 3.2,
    dimensions: 'Various pieces included',
    color: 'White',
    material: 'Porcelain',
    is_featured: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop', alt: 'Porcelain Dinnerware Set', is_primary: true }
    ]
  },

  // Bedding & Bath
  {
    name: 'Luxury Bedding Set',
    slug: 'luxury-bedding-set',
    description: 'Ultra-soft luxury bedding set with duvet cover, sheet set, and pillowcases. Made from premium cotton for ultimate comfort.',
    short_description: 'Luxury cotton bedding set',
    sku: 'LB-SET-001',
    price: 199.99,
    compare_at_price: 299.99,
    stock_quantity: 30,
    category_id: 4, // Bedding & Bath (main category)
    brand: 'Modahaus',
    weight: 2.5,
    dimensions: 'Queen size',
    color: 'White',
    material: '100% Cotton',
    is_featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=600&h=600&fit=crop', alt: 'Luxury Bedding Set', is_primary: true }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    await db.init(); // Initialize the database connection and tables

    // Clear existing data to prevent unique constraint errors on re-seeding
    console.log('🧹 Clearing existing data...');
    // TRUNCATE tables that have foreign key dependencies first
    await db.run('TRUNCATE TABLE product_images CASCADE');
    await db.run('TRUNCATE TABLE reviews CASCADE');
    await db.run('TRUNCATE TABLE order_items CASCADE');
    await db.run('TRUNCATE TABLE orders CASCADE');
    await db.run('TRUNCATE TABLE cart_items CASCADE');
    await db.run('TRUNCATE TABLE wishlist CASCADE');
    await db.run('TRUNCATE TABLE addresses CASCADE');
    await db.run('TRUNCATE TABLE products CASCADE');
    await db.run('TRUNCATE TABLE categories CASCADE');
    await db.run('TRUNCATE TABLE users CASCADE');

    console.log('✅ Existing data cleared and serial sequences reset.');

    // Insert categories
    console.log('📂 Inserting categories...');
    const categoryIdMap: { [slug: string]: number } = {};
    const productCategoryIdMap: { [categoryIndex: number]: number } = {};

    // Separate main categories (parent_id is null) and subcategories
    const mainCategories = sampleCategories.filter(cat => cat.parent_id === null);
    const subCategories = sampleCategories.filter(cat => cat.parent_id !== null);

    // Insert main categories and build a map of their slugs to their actual database IDs
    for (const category of mainCategories) {
      const result = await db.run(`
        INSERT INTO categories (name, slug, description, parent_id, image_url, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        category.name,
        category.slug,
        category.description,
        category.parent_id,
        category.image_url,
        category.sort_order
      ]);
      categoryIdMap[category.slug] = result.lastID;
      // Also map original index to new ID for products
      productCategoryIdMap[sampleCategories.indexOf(category)] = result.lastID;
    }

    // Insert subcategories, updating parent_id using the map
    for (const category of subCategories) {
      const parentIndex = category.parent_id! - 1; // Get original parent category index
      const parentCategory = sampleCategories[parentIndex]; // Get original parent category object
      
      if (parentCategory) { // Add null check
        const actualParentId = categoryIdMap[parentCategory.slug]; // Get the actual ID from the DB

        const result = await db.run(`
          INSERT INTO categories (name, slug, description, parent_id, image_url, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          category.name,
          category.slug,
          category.description,
          actualParentId,
          category.image_url,
          category.sort_order
        ]);
        categoryIdMap[category.slug] = result.lastID;
        // Also map original index to new ID for products
        productCategoryIdMap[sampleCategories.indexOf(category)] = result.lastID;
      }
    }
    console.log(`✅ Inserted ${sampleCategories.length} categories`);

    // Insert products
    console.log('🛍️ Inserting products...');
    for (const product of sampleProducts) {
      // Use the mapped category_id
      const actualCategoryId = productCategoryIdMap[product.category_id! - 1];
      const result = await db.run(`
        INSERT INTO products (
          name, slug, description, short_description, sku, price, compare_at_price,
          stock_quantity, category_id, brand, weight, dimensions, color, material,
          is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        product.name,
        product.slug,
        product.description,
        product.short_description,
        product.sku,
        product.price,
        product.compare_at_price,
        product.stock_quantity,
        actualCategoryId, // Use the dynamically mapped category_id
        product.brand,
        product.weight,
        product.dimensions,
        product.color,
        product.material,
        product.is_featured // Boolean values for PostgreSQL
      ]);

      const productId = result.lastID;

      // Insert product images
      for (const image of product.images) {
        await db.run(`
          INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          productId,
          image.url,
          image.alt,
          image.is_primary, // Boolean values for PostgreSQL
          0
        ]);
      }
    }
    console.log(`✅ Inserted ${sampleProducts.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    const imageCount = await db.get('SELECT COUNT(*) as count FROM product_images');

    console.log('\n📊 Database Summary:');
    console.log(`   Categories: ${categoryCount?.count}`);
    console.log(`   Products: ${productCount?.count}`);
    console.log(`   Product Images: ${imageCount?.count}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1); // Exit with error code
  } finally {
    await db.close(); // Ensure database connection is closed
  }
}

// Run the seeding
seedDatabase();