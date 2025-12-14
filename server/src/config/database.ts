import { Pool, QueryResult, QueryResultRow } from 'pg';
import path from 'path';

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  // Initialize database connection and tables
  public async init(): Promise<void> {
    try {
      await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      await this.initTables();
    } catch (err) {
      console.error('Error connecting to or initializing database:', err);
      throw err;
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
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        category_id INTEGER NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);

    // Add other tables (wishlist, cart_items, orders, order_items, reviews, refunds) here...
    // You can replicate same pattern as above
  }

  // Run DML/DDL statements
  public async run(
    sql: string,
    params: any[] = []
  ): Promise<{ changes: number; lastID: number }> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<QueryResultRow> = await client.query(sql, params);
      const lastID = result.rows[0]?.id ? Number(result.rows[0].id) : 0;
      return { changes: result.rowCount, lastID };
    } finally {
      client.release();
    }
  }

  // Get single row
  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<T> = await client.query(sql, params);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get multiple rows
  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<T> = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Close connection pool
  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🔒 Database connection pool closed');
  }
}