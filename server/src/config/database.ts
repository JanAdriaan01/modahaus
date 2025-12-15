// src/config/database.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

export class Database {
  private pool: Pool;

  constructor() {
    // Check for required environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
      // Critical for serverless deployment
      max: 1, // Limit to 1 connection for serverless
      min: 0,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit in serverless environment
    });
  }

  public async init(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1'); // Test connection
      client.release();
      console.log('✅ Connected to PostgreSQL database');
      await this.initTables();
    } catch (err) {
      console.error('Error connecting to database:', err);
      throw new Error(`Database connection failed: ${err.message}`);
    }
  }

  private async initTables(): Promise<void> {
    // Users table
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await this.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        parent_id INTEGER,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Products table
    await this.run(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        sku VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        compare_at_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        category_id INTEGER NOT NULL,
        brand VARCHAR(100),
        weight DECIMAL(8,2),
        dimensions VARCHAR(100),
        color VARCHAR(50),
        size VARCHAR(50),
        material VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        meta_title VARCHAR(255),
        meta_description VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);

    // Product images table
    await this.run(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Addresses table
    await this.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        company VARCHAR(100),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Orders table
    await this.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(255) DEFAULT 'pending',
        payment_status VARCHAR(255) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_id VARCHAR(255),
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        shipping_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        billing_address TEXT,
        shipping_address TEXT,
        shipping_method VARCHAR(100),
        tracking_number VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
      )
    `);

    // Order items table
    await this.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);

    // Wishlist table
    await this.run(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    // Cart items table
    await this.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    // Reviews table
    await this.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        order_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        is_verified_purchase BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        UNIQUE(user_id, product_id, order_id)
      )
    `);

    // Refunds table
    await this.run(`
      CREATE TABLE IF NOT EXISTS refunds (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason VARCHAR(255),
        status VARCHAR(255) DEFAULT 'requested',
        refund_method VARCHAR(50),
        refund_id VARCHAR(255),
        notes TEXT,
        processed_by INTEGER,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ PostgreSQL database tables created successfully');
  }

  public async run(
    sql: string,
    params: any[] = []
  ): Promise<{ changes: number; lastID: number }> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<QueryResultRow> = await client.query(sql, params);
      
      const firstRow = result.rows[0];
      const lastID = firstRow && typeof firstRow.id === 'number' ? firstRow.id : 0;
      
      return { changes: result.rowCount || 0, lastID };
    } finally {
      client.release();
    }
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<QueryResultRow> = await client.query(sql, params);
      const row = result.rows[0];
      return row ? row as unknown as T : undefined;
    } finally {
      client.release();
    }
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<QueryResultRow> = await client.query(sql, params);
      return result.rows as unknown as T[];
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🔒 Database connection pool closed');
  }
}

// Export singleton instance
export const database = new Database();