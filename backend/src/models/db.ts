import { Pool, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const dbSsl = process.env.DB_SSL === 'true';

const poolOptions = connectionString
  ? {
      connectionString,
      ssl: dbSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'registration_db',
      ssl: dbSsl ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolOptions);

export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking and initializing PostgreSQL Database...');

    // 1. Create Admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      )
    `);

    // 2. Create Registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        registration_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        parent_spouse_name TEXT NOT NULL,
        full_address TEXT NOT NULL,
        area_village TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        taluk TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT,
        country TEXT,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by TEXT,
        rejection_reason TEXT,
        notes TEXT
      )
    `);

    // Self-healing: add columns state and country if they don't exist
    await client.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS state TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT
    `);

    // 3. Create Activity Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        registration_id TEXT,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Seed default admin (Admin@123) if it doesn't exist
    const hash = bcrypt.hashSync('Admin@123', 12);
    await client.query(`
      INSERT INTO admins (id, username, email, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, ['admin-uuid-1', 'admin', 'admin@registrationapp.com', hash]);

    console.log('✅ PostgreSQL Database connected and initialized');
  } catch (error) {
    console.error('❌ Failed to connect or initialize PostgreSQL database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Expose a custom pool interface that delegates to pg and translates SQLite placeholders
const customPool = {
  query: (text: string, params?: any[]): Promise<QueryResult<any>> => {
    let index = 1;
    // Replace "?" with "$1", "$2", etc.
    const pgText = text.replace(/\?/g, () => `$${index++}`);
    return pool.query(pgText, params);
  },
  connect: () => pool.connect(),
  end: () => pool.end(),
  on: (event: string, listener: (...args: any[]) => void) => pool.on(event as any, listener),
};

export default customPool;
