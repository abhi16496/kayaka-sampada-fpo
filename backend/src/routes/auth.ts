import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../models/db';
import { AuthRequest, authenticateAdmin } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update last login
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      token,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ admin: req.admin });
});

// POST /api/auth/logout (client-side token removal; server can log it)
router.post('/logout', authenticateAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  // Log logout action
  try {
    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, details) VALUES ($1, $2, $3, $4)',
      [uuidv4(), req.admin!.id, 'logout', 'Admin logged out']
    );
  } catch {/* non-critical */}
  res.json({ message: 'Logged out successfully' });
});

export default router;
