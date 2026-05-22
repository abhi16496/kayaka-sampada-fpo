'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import {
  FileText, ArrowLeft, Phone, Search,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const API_URL = '';

interface StatusData {
  registration_id: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: 'var(--warning)',  bg: 'var(--warning-bg)',  bdr: 'var(--warning-bdr)',  label: 'Pending Approval', message: 'Your application is currently under review by our admin team. Please check back later.' },
  approved: { icon: CheckCircle,  color: 'var(--success)',  bg: 'var(--success-bg)',  bdr: 'var(--success-bdr)',  label: 'Approved',         message: 'Congratulations! Your registration has been approved successfully.' },
  rejected: { icon: XCircle,      color: 'var(--danger)',   bg: 'var(--danger-bg)',   bdr: 'var(--danger-bdr)',   label: 'Rejected',         message: 'Your registration was not approved by the admin. See the reason below.' },
};

export default function StatusPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusData | null>(null);
  const [error, setError] = useState('');

  const check = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`${API_URL}/api/register/status/${clean}`);
      setResult(res.data.registration);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('No registration found for this phone number.');
      } else {
        setError('Could not check status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="user-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,var(--blue-800),var(--blue-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Kayaka Sampada</span>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <Link href="/register" className="btn btn-primary btn-sm">Register Now</Link>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      {/* ── Banner ──────────────────────────────────────────────── */}
      <div className="user-hero" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, color: '#fff', marginBottom: '.5rem' }}>
            Check Registration Status
          </h1>
          <p style={{ color: 'rgba(255,255,255,.78)' }}>Enter your registered mobile number to track your application.</p>
        </motion.div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1rem 5rem' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>

          {/* Lookup card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
              Track Your Application
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="status-phone">
                Mobile Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="status-phone"
                  type="tel"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 38 }}
                  placeholder="Enter your registered mobile number"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && check()}
                />
              </div>
              {error && <p className="form-error">{error}</p>}
            </div>

            <button
              id="check-status-btn"
              onClick={check}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? <><div className="spinner" />Checking...</> : <><Search size={17} />Check Status</>}
            </button>
          </div>

          {/* Result */}
          {result && (() => {
            const cfg = STATUS_CONFIG[result.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: '1.75rem', marginTop: '1.25rem' }}
              >
                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={26} color={cfg.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Current Status</p>
                    <span className={`badge badge-${result.status}`} style={{ fontSize: '.9rem' }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65, marginBottom: '1.25rem', background: 'var(--surface-2)', borderRadius: 8, padding: '.75rem 1rem' }}>
                  {cfg.message}
                </p>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                  {(
                    [
                      ['Registration ID', result.registration_id],
                      ['Full Name', result.full_name],
                      ['Submitted At', new Date(result.submitted_at).toLocaleString('en-IN')],
                      ...(result.reviewed_at ? [['Reviewed At', new Date(result.reviewed_at).toLocaleString('en-IN')]] : []),
                    ] as [string, string][]
                  ).map((pair) => (
                    <div key={pair[0]} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '.625rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '.875rem', flexShrink: 0 }}>{pair[0]}</span>
                      <span style={{ fontWeight: pair[0] === 'Registration ID' ? 800 : 600, color: pair[0] === 'Registration ID' ? 'var(--blue-700)' : 'var(--text-primary)', fontSize: '.9rem', textAlign: 'right' }}>{pair[1]}</span>
                    </div>
                  ))}
                </div>

                {result.rejection_reason && (
                  <div style={{ marginTop: '1.25rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-bdr)', borderRadius: 10, padding: '1rem', display: 'flex', gap: '.75rem' }}>
                    <AlertCircle size={17} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '.875rem', marginBottom: 4 }}>Reason for Rejection</p>
                      <p style={{ color: '#991b1b', fontSize: '.875rem', lineHeight: 1.55 }}>{result.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Help text */}
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '.84rem', marginTop: '2rem' }}>
            Don't have a registration yet?{' '}
            <Link href="/register" style={{ color: 'var(--blue-600)', fontWeight: 600, textDecoration: 'none' }}>
              Register here →
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
