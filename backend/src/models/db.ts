import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL;

const isLocalHost = (host?: string): boolean => {
  if (!host) return false;
  return host.includes('localhost') || host.includes('127.0.0.1');
};

const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false 
        : { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'registration_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isLocalHost(process.env.DB_HOST)
        ? false 
        : { rejectUnauthorized: false }
    });

export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    
    // Check if the 'admins' table exists to decide if we need initialization
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `);
    
    const tableExists = tableCheck.rows[0]?.exists;
    
    if (!tableExists) {
      console.log('🔄 PostgreSQL "admins" table not found. Initializing database schema...');
      
      const pathsToTry = [
        path.join(__dirname, '..', '..', '..', 'database', 'schema.sql'),
        path.join(__dirname, '..', '..', 'database', 'schema.sql'),
        path.join(process.cwd(), 'database', 'schema.sql'),
        path.join(process.cwd(), '..', 'database', 'schema.sql')
      ];
      
      let schemaSql = '';
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          schemaSql = fs.readFileSync(p, 'utf8');
          console.log(`📖 Loaded schema from: ${p}`);
          break;
        }
      }
      
      if (schemaSql) {
        // Execute the schema SQL
        await client.query(schemaSql);
        console.log('✅ Database schema initialized successfully');
      } else {
        console.warn('⚠️ Could not locate database/schema.sql to auto-initialize the database.');
      }
    } else {
      console.log('✅ Database tables already initialized.');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect or initialize PostgreSQL database:', error);
    throw error;
  }
};

// Custom query wrapper to convert SQLite-style '?' placeholders to standard Postgres '$1, $2...' placeholders
const poolWrapper = {
  query: (text: string, params?: any[]): Promise<{ rows: any[], rowCount: number }> => {
    let pgText = text;
    if (params && params.length > 0) {
      let index = 1;
      // Replace only "?" characters that are not inside quotes.
      // Since our queries don't have "?" inside quoted string literals, we can do a simple global replace.
      pgText = text.replace(/\?/g, () => `$${index++}`);
    }
    return pool.query(pgText, params).then(result => ({
      rows: result.rows || [],
      rowCount: result.rowCount ?? 0
    }));
  }
};

export default poolWrapper;
