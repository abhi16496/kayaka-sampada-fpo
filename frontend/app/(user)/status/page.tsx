'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft, Phone, Search,
  Clock, CheckCircle, XCircle, AlertCircle, Sprout, Printer, HelpCircle
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
  pending:  { icon: Clock,        color: 'var(--warning)',  bg: 'var(--warning-bg)',  bdr: 'var(--warning-bdr)',  label: 'Pending FPO Board Review', message: 'Your application is currently under verification by our local board. We review and verify all details within 24 hours.' },
  approved: { icon: CheckCircle,  color: 'var(--success)',  bg: 'var(--success-bg)',  bdr: 'var(--success-bdr)',  label: 'Approved & Active Member',  message: 'Congratulations! Your membership is verified and active. You are now eligible for FPO seeds, fertilizer subsidies, and crop buybacks.' },
  rejected: { icon: XCircle,      color: 'var(--danger)',   bg: 'var(--danger-bg)',   bdr: 'var(--danger-bdr)',   label: 'Application Rejected',        message: 'Your membership request could not be processed by the board. Please see the committee remarks below.' },
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
        setError('No registration record found for this mobile number.');
      } else {
        setError('Could not verify status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="user-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary-forest),var(--primary-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={18} color="#fff" />
          </div>
          <div>
            <span className="font-serif" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>ಕಾಯಕ ಸಂಪಾದ</span>
            <span style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>FPO STATUS</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <Link href="/register" className="btn btn-primary btn-sm">Join FPO</Link>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      {/* ── Banner ──────────────────────────────────────────────── */}
      <div className="user-hero" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Member Verification Portal</span>
          <h1 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', fontWeight: 700, color: '#fff', marginTop: '.25rem', marginBottom: '.5rem' }}>
            Track Registration Status
          </h1>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: '.95rem' }}>Enter your registered 10-digit mobile number below.</p>
        </motion.div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 1rem 6rem' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>

          {/* Lookup card */}
          <div className="card card-textured" style={{ padding: '2.25rem', borderTop: '4px solid var(--primary-forest)' }}>
            <h2 className="font-serif" style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>
              Search Membership Directory
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="status-phone" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mobile Number</span>
                <span style={{ fontSize: '.72rem', color: 'var(--text-light)', fontWeight: 500, fontStyle: 'italic' }}>ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  id="status-phone"
                  type="tel"
                  className={`form-input${error ? ' error' : ''}`}
                  style={{ paddingLeft: 42 }}
                  placeholder="Enter registered mobile number"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && check()}
                />
              </div>
              {error && <p className="form-error">⚠️ {error}</p>}
            </div>

            <button
              id="check-status-btn"
              onClick={check}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? <><div className="spinner" /> Querying registry...</> : <><Search size={17} /> Track Registration Status</>}
            </button>
          </div>

          {/* Result rendered as a physical receipt */}
          {result && (() => {
            const cfg = STATUS_CONFIG[result.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '1.75rem', padding: 0 }}
              >
                <div className="receipt-card">
                  {/* Watermark Stamps */}
                  {result.status === 'approved' && <div className="stamp-approved">FPO Verified</div>}
                  {result.status === 'pending' && <div className="stamp-pending">Awaiting Review</div>}
                  {result.status === 'rejected' && <div className="stamp-approved" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Disapproved</div>}

                  {/* Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-sage)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .5rem' }}>
                      <Icon size={24} color={cfg.color} />
                    </div>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06rem' }}>Member Registry Entry</span>
                    <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-forest)', marginTop: 2 }}>
                      {result.full_name}
                    </h3>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--surface-2)', borderRadius: 8, padding: '1rem' }}>
                    {cfg.message}
                  </p>

                  {/* Details Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
                    {[
                      ['Registration Token', result.registration_id],
                      ['Filing Date', new Date(result.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
                      ...(result.reviewed_at ? [['Verification Date', new Date(result.reviewed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })]] : []),
                      ['FPO Status State', cfg.label],
                    ].map((pair) => (
                      <div key={pair[0]} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '.65rem', borderBottom: '1px solid rgba(18, 53, 36, 0.04)' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '.84rem', fontWeight: 600 }}>{pair[0]}</span>
                        <span style={{ fontWeight: pair[0] === 'Registration Token' ? 800 : 700, color: pair[0] === 'Registration Token' ? 'var(--primary-emerald)' : 'var(--text-primary)', fontSize: '.9rem', textAlign: 'right', fontFamily: pair[0] === 'Registration Token' ? 'monospace' : 'inherit' }}>{pair[1]}</span>
                      </div>
                    ))}
                  </div>

                  {result.rejection_reason && (
                    <div style={{ marginBottom: '1.5rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-bdr)', borderRadius: 10, padding: '1rem', display: 'flex', gap: '.75rem' }}>
                      <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '.875rem', marginBottom: 4 }}>Committee Disapproval Remarks</p>
                        <p style={{ color: '#991b1b', fontSize: '.875rem', lineHeight: 1.5 }}>{result.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Helpline info panel */}
                  <div style={{ background: 'var(--bg-linen)', border: '1px solid var(--border-sage)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                    <HelpCircle size={18} color="var(--primary-sage)" />
                    <p style={{ fontSize: '.82rem', color: 'var(--text-sage)', lineHeight: 1.45 }}>
                      Need faster verification? Call the FPO board secretariat at <strong>+91 80 2345 6789</strong> or email <strong>secretariat@kayakasampadafpo.org</strong>.
                    </p>
                  </div>

                  {/* Print / Actions */}
                  <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', borderTop: '2px dashed var(--border-sage)', paddingTop: '1.25rem' }} className="no-print">
                    <button onClick={() => window.print()} className="btn btn-outline" style={{ display: 'flex', gap: 6 }}>
                      <Printer size={16} /> Print Statement
                    </button>
                    <Link href="/" className="btn btn-ghost">Home</Link>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Help text */}
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '.84rem', marginTop: '2.5rem', fontWeight: 600 }}>
            Don't have an application filed?{' '}
            <Link href="/register" style={{ color: 'var(--primary-emerald)', textDecoration: 'underline' }}>
              Register for FPO membership here →
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

