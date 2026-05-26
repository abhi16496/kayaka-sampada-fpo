import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../models/db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { sendApprovalEmail } from '../utils/ses';
import bcrypt from 'bcryptjs';

const router = Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// ─── Dashboard Stats ──────────────────────────────────────────
// GET /api/admin/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN submitted_at >= NOW() - INTERVAL '1 day' THEN 1 ELSE 0 END) AS today
      FROM registrations
    `);

    // Recent activity (last 10)
    const recentActivity = await pool.query(`
      SELECT al.action, al.details, al.created_at, a.username AS admin_name,
             r.registration_id, r.full_name
      FROM activity_logs al
      LEFT JOIN admins a ON a.id = al.admin_id
      LEFT JOIN registrations r ON r.id = al.registration_id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    // Daily registrations for chart (last 7 days)
    const chartData = await pool.query(`
      SELECT CAST(submitted_at AS DATE) AS date, COUNT(*) AS count
      FROM registrations
      WHERE submitted_at >= NOW() - INTERVAL '7 days'
      GROUP BY CAST(submitted_at AS DATE)
      ORDER BY date
    `);

    res.json({
      stats: stats.rows[0] || { total: 0, pending: 0, approved: 0, rejected: 0, today: 0 },
      recentActivity: recentActivity.rows,
      chartData: chartData.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ─── List Registrations ───────────────────────────────────────
// GET /api/admin/registrations?status=&search=&page=&limit=
router.get('/registrations', async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    status = '',
    search = '',
    page = '1',
    limit = '10',
    sortBy = 'submitted_at',
    sortOrder = 'DESC',
  } = req.query as Record<string, string>;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    params.push(status);
    conditions.push(`status = ?`);
  }

  if (search) {
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    conditions.push(
      `(full_name ILIKE ? OR phone ILIKE ? OR registration_id ILIKE ? OR district ILIKE ?)`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSort = ['submitted_at', 'full_name', 'status', 'registration_id'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 'submitted_at';
  const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  params.push(parseInt(limit));
  params.push(offset);

  try {
    const [rows, countResult] = await Promise.all([
      pool.query(
        `SELECT r.*, a.username AS reviewed_by_name
         FROM registrations r
         LEFT JOIN admins a ON a.id = r.reviewed_by
         ${whereClause}
         ORDER BY ${safeSort} ${safeOrder}
         LIMIT ? OFFSET ?`,
        params
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM registrations ${whereClause}`,
        params.slice(0, -2)
      ),
    ]);

    res.json({
      registrations: rows.rows,
      total: parseInt(countResult.rows[0]?.count || '0'),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0]?.count || '0') / parseInt(limit)),
    });
  } catch (err) {
    console.error('List registrations error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// ─── Get Single Registration ──────────────────────────────────
// GET /api/admin/registrations/:id
router.get('/registrations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT r.*, a.username AS reviewed_by_name
       FROM registrations r
       LEFT JOIN admins a ON a.id = r.reviewed_by
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    res.json({ registration: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// ─── Approve Registration ─────────────────────────────────────
// PUT /api/admin/registrations/:id/approve
router.put('/registrations/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const check = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    const reg = check.rows[0];

    if (reg.status === 'approved') {
      res.status(400).json({ error: 'Registration is already approved.' });
      return;
    }

    await pool.query(
      `UPDATE registrations
       SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, notes = ?
       WHERE id = ?`,
      [req.admin!.id, notes || null, id]
    );

    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, registration_id, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'approve', id, `Approved registration ${reg.registration_id}`]
    );

    let emailSent = false;
    let emailError = null;

    if (reg.email) {
      console.log(`[Email Notification] Triggering SES email send for: ${reg.email}`);
      try {
        await sendApprovalEmail(reg.email, reg.full_name, reg.registration_id);
        emailSent = true;
        await pool.query(
          'INSERT INTO activity_logs (id, admin_id, action, registration_id, details) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), req.admin!.id, 'email_sent', id, `Approval email sent successfully to ${reg.email}`]
        );
      } catch (err: any) {
        emailError = err.message || 'Unknown email error';
        console.error(`[Email Notification Error] Error sending email to ${reg.email}:`, err);
        await pool.query(
          'INSERT INTO activity_logs (id, admin_id, action, registration_id, details) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), req.admin!.id, 'email_failed', id, `Failed to send approval email: ${emailError}`]
        );
      }
    } else {
      console.log(`[Email Notification] No email address found for registration: ${reg.registration_id}`);
    }

    res.json({ 
      message: 'Registration approved successfully', 
      emailSent,
      emailError,
      registration: { ...reg, status: 'approved' } 
    });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// ─── Reject Registration ──────────────────────────────────────
// PUT /api/admin/registrations/:id/reject
router.put('/registrations/:id/reject', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason) {
    res.status(400).json({ error: 'Rejection reason is required' });
    return;
  }

  try {
    const check = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    await pool.query(
      `UPDATE registrations
       SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, rejection_reason = ?
       WHERE id = ?`,
      [req.admin!.id, rejection_reason, id]
    );

    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, registration_id, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'reject', id, `Rejected: ${rejection_reason}`]
    );

    res.json({ message: 'Registration rejected', registration: { ...check.rows[0], status: 'rejected' } });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
});

// ─── Mark as Pending ──────────────────────────────────────────
// PUT /api/admin/registrations/:id/pending
router.put('/registrations/:id/pending', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    await pool.query(
      `UPDATE registrations
       SET status = 'pending', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, notes = NULL, rejection_reason = NULL
       WHERE id = ?`,
      [req.admin!.id, id]
    );

    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, registration_id, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'pending', id, `Moved back to pending: ${check.rows[0].registration_id}`]
    );


    res.json({ message: 'Registration moved to pending', registration: { ...check.rows[0], status: 'pending', notes: null, rejection_reason: null } });
  } catch (err) {
    console.error('Pending error:', err);
    res.status(500).json({ error: 'Failed to mark as pending' });
  }
});

// ─── Export CSV ───────────────────────────────────────────────
// GET /api/admin/export?status=
router.get('/export', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status = '' } = req.query as { status?: string };
  const safeStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : '';
  const conditions = safeStatus ? `WHERE status = '${safeStatus}'` : '';

  try {
    const result = await pool.query(
      `SELECT registration_id, full_name, parent_spouse_name, full_address, area_village,
              pin_code, taluk, district, state, country, phone, email, status, submitted_at, reviewed_at
       FROM registrations ${conditions}
       ORDER BY submitted_at DESC`
    );

    // Build CSV manually
    const headers = [
      'Registration ID', 'Full Name', 'Father/Mother/Husband', 'Full Address',
      'Area/Village', 'PIN Code', 'Taluk', 'District', 'State', 'Country', 'Phone', 'Email',
      'Status', 'Submitted At', 'Reviewed At',
    ];
    const csvEscape = (val: unknown): string => {
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const rows = result.rows.map((r) => [
      r.registration_id, r.full_name, r.parent_spouse_name, r.full_address,
      r.area_village, r.pin_code, r.taluk, r.district, r.state || '', r.country || '', r.phone, r.email || '',
      r.status, r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
      r.reviewed_at ? new Date(r.reviewed_at).toISOString() : '',
    ].map(csvEscape).join(','));
    const csv = [headers.join(','), ...rows].join('\n');


    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'export', `Exported ${result.rows.length} registrations (filter: ${safeStatus || 'all'})`]
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="registrations-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// ─── Activity Logs ─────────────────────────────────────────────
// GET /api/admin/logs
router.get('/logs', async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const result = await pool.query(
      `SELECT al.*, a.username AS admin_name, r.registration_id, r.full_name
       FROM activity_logs al
       LEFT JOIN admins a ON a.id = al.admin_id
       LEFT JOIN registrations r ON r.id = al.registration_id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// ─── Delete Registration ─────────────────────────────────────────
// DELETE /api/admin/registrations/:id
router.delete('/registrations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    const reg = check.rows[0];

    // Set registration_id to NULL on activity logs referencing this registration
    await pool.query('UPDATE activity_logs SET registration_id = NULL WHERE registration_id = ?', [id]);

    // Delete the registration
    await pool.query('DELETE FROM registrations WHERE id = ?', [id]);

    // Insert an activity log for the deletion
    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'delete', `Deleted registration ${reg.registration_id} (${reg.full_name})`]
    );

    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// ─── List Admins ─────────────────────────────────────────────
// GET /api/admin/admins
router.get('/admins', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, created_at, last_login
       FROM admins
       ORDER BY created_at ASC`
    );
    res.json({ admins: result.rows });
  } catch (err) {
    console.error('List admins error:', err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// ─── Create Admin ────────────────────────────────────────────
// POST /api/admin/admins
router.post('/admins', async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    // Check if username already exists
    const checkUser = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
    if (checkUser.rows.length > 0) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    if (email) {
      const checkEmail = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
      if (checkEmail.rows.length > 0) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdminId = uuidv4();

    await pool.query(
      `INSERT INTO admins (id, username, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [newAdminId, username, email || null, hashedPassword]
    );

    await pool.query(
      'INSERT INTO activity_logs (id, admin_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.admin!.id, 'create_admin', `Created new admin: ${username}`]
    );

    res.json({ message: 'Admin created successfully', admin: { id: newAdminId, username, email } });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

export default router;
