-- ============================================================
-- Kayaka Sampada Farmer Producer Organisation — PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Admins table
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ============================================================
-- Registrations table (single table, status-based workflow)
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL,   -- e.g. REG-20260001
    full_name VARCHAR(255) NOT NULL,
    parent_spouse_name VARCHAR(255) NOT NULL,        -- Father/Mother/Husband Name
    full_address TEXT NOT NULL,
    area_village VARCHAR(255) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    taluk VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(15) UNIQUE NOT NULL,

    email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'   -- pending | approved | rejected
        CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES admins(id),
    rejection_reason TEXT,
    notes TEXT
);

-- ============================================================
-- Activity Logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id),
    action VARCHAR(50) NOT NULL,                    -- approve | reject | login | export
    registration_id UUID REFERENCES registrations(id),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_status     ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_phone      ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_submitted  ON registrations(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_reg_id     ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin      ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created    ON activity_logs(created_at DESC);

-- ============================================================
-- Seed: Default admin (password: Admin@123)
-- Run: node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123',12))"
-- Replace the hash below after generating it, or use the backend seed script
-- ============================================================
INSERT INTO admins (username, email, password_hash)
VALUES (
    'admin',
    'admin@registrationapp.com',
    '$2a$12$g.F2FQRLUB2mKRYPxOjPHuP0xQ1Yy13O5JB8ubcPXNLoOgwhKe4fu'  -- Admin@123
)
ON CONFLICT (username) DO NOTHING;
