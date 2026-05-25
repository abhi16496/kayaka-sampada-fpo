import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Store database in a dedicated /data directory so it can be mounted
// as a persistent Docker volume — prevents data loss on container restarts/redeploys.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

// Initialize SQLite database at the persistent path
const db = new (sqlite3.verbose()).Database(DB_PATH);

export const testConnection = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admins table
      db.run(`CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`);

      // Registrations table
      db.run(`CREATE TABLE IF NOT EXISTS registrations (
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
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        rejection_reason TEXT,
        notes TEXT
      )`);

      // Run self-healing columns update for existing databases
      db.run(`ALTER TABLE registrations ADD COLUMN state TEXT`, () => {});
      db.run(`ALTER TABLE registrations ADD COLUMN country TEXT`, () => {});


      // Activity Logs table
      db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        registration_id TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Seed default admin (Admin@123)
      const hash = bcrypt.hashSync('Admin@123', 12);
      db.run(
        `INSERT OR IGNORE INTO admins (id, username, email, password_hash) VALUES (?, ?, ?, ?)`,
        ['admin-uuid-1', 'admin', 'admin@registrationapp.com', hash]
      );

      console.log('✅ SQLite Database connected and initialized');
      resolve();
    });
  });
};

// Mock `pg` Pool interface
const pool = {
  query: (text: string, params?: any[]): Promise<{ rows: any[], rowCount: number }> => {
    return new Promise((resolve, reject) => {
      // Convert Postgres syntax to SQLite syntax
      let sqliteText = text
        .replace(/\$\d+/g, '?')
        .replace(/NOW\(\)/g, "CURRENT_TIMESTAMP")
        .replace(/ILIKE/g, "LIKE");

      // Handle RETURNING id (SQLite only returns id of inserted row via this.lastID if it's rowid,
      // but newer SQLite supports RETURNING. Let's just use RETURNING since Node 18+ SQLite3 supports it)
      const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');
      const isReturning = sqliteText.toUpperCase().includes('RETURNING');

      if (isSelect || isReturning) {
        db.all(sqliteText, params || [], function(err, rows) {
          if (err) return reject(err);
          resolve({ rows: rows || [], rowCount: rows?.length || 0 });
        });
      } else {
        db.run(sqliteText, params || [], function(err) {
          if (err) return reject(err);
          resolve({ rows: [], rowCount: this.changes });
        });
      }
    });
  }
};

export default pool;
