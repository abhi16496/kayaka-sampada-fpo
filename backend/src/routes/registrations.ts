import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../models/db';

const router = Router();

// Generate unique registration ID: REG-YYYYNNNN
const generateRegistrationId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const result = await pool.query(
    "SELECT registration_id FROM registrations WHERE registration_id LIKE $1 ORDER BY registration_id DESC LIMIT 1",
    [`REG-${year}%`]
  );
  if (result.rows.length === 0) {
    return `REG-${year}0001`;
  }
  const lastId = result.rows[0].registration_id;
  const lastNum = parseInt(lastId.slice(-4));
  const nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
  return `REG-${year}${String(nextNum).padStart(4, '0')}`;
};

// POST /api/register
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    full_name,
    parent_spouse_name,
    full_address,
    area_village,
    pin_code,
    taluk,
    district,
    state,
    country,
    phone,
    email,
  } = req.body;

  // Basic required field validation
  const requiredFields = { full_name, parent_spouse_name, full_address, area_village, pin_code, taluk, district, state, country, phone };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || String(value).trim() === '') {
      res.status(400).json({ error: `Field '${field}' is required` });
      return;
    }
  }

  // Phone validation
  const phoneClean = String(phone).replace(/\D/g, '');
  if (phoneClean.length < 10 || phoneClean.length > 15) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }

  // PIN code validation
  if (!/^\d{6}$/.test(String(pin_code))) {
    res.status(400).json({ error: 'PIN code must be 6 digits' });
    return;
  }

  // Email validation (if provided)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  try {
    // Duplicate phone check
    const existing = await pool.query(
      'SELECT id, status FROM registrations WHERE phone = $1',
      [phoneClean]
    );
    if (existing.rows.length > 0) {
      const existingReg = existing.rows[0];
      res.status(409).json({
        error: `A registration with this phone number already exists (Status: ${existingReg.status}).`,
      });
      return;
    }

    const registration_id = await generateRegistrationId();

    const result = await pool.query(
      `INSERT INTO registrations 
        (id, registration_id, full_name, parent_spouse_name, full_address, area_village, pin_code, taluk, district, state, country, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, registration_id, full_name, status, submitted_at`,
      [
        uuidv4(),
        registration_id,
        full_name.toUpperCase().trim(),
        parent_spouse_name.toUpperCase().trim(),
        full_address.toUpperCase().trim(),
        area_village.toUpperCase().trim(),
        pin_code.trim(),
        taluk.toUpperCase().trim(),
        district.toUpperCase().trim(),
        state ? state.toUpperCase().trim() : '',
        country ? country.toUpperCase().trim() : 'INDIA',
        phoneClean,
        email ? email.toLowerCase().trim() : null,
      ]
    );


    const reg = result.rows[0];

    res.status(201).json({
      message: 'Registration submitted successfully. Your application is pending admin approval.',
      registration: {
        id: reg.id,
        registration_id: reg.registration_id,
        full_name: reg.full_name,
        status: reg.status,
        submitted_at: reg.submitted_at,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// GET /api/register/status/:phone
router.get('/status/:phone', async (req: Request, res: Response): Promise<void> => {
  const phoneClean = req.params.phone.replace(/\D/g, '');

  try {
    const result = await pool.query(
      `SELECT registration_id, full_name, status, submitted_at, reviewed_at, rejection_reason
       FROM registrations WHERE phone = $1`,
      [phoneClean]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No registration found for this phone number' });
      return;
    }

    res.json({ registration: result.rows[0] });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;
