'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileText, UserPlus, Search, Clock, CheckCircle,
  ChevronRight, Shield, Phone, MapPin, ArrowRight
} from 'lucide-react';

const steps = [
  { num: '01', icon: FileText,    title: 'Fill the Form',   desc: 'Enter your personal details accurately in the registration form.' },
  { num: '02', icon: UserPlus,    title: 'Submit',          desc: 'Submit securely. You receive a unique Registration ID instantly.' },
  { num: '03', icon: Clock,       title: 'Under Review',    desc: 'Our admin team reviews your application within 24 hours.' },
  { num: '04', icon: CheckCircle, title: 'Get Approved',    desc: 'Receive your approval. Use your ID for all future references.' },
];

export default function UserHomePage() {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="user-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <Image src="/logo.jpeg" alt="Logo" width={38} height={38} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>Kayaka Sampada</p>
            <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', letterSpacing: '.03em' }}>Farmer Producer Organisation</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <Link href="/status" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', fontSize: '.9rem', padding: '.4rem .8rem', borderRadius: 8, transition: 'background .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Search size={15} /> Check Status
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Register Now
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="user-hero" style={{ padding: 'clamp(3rem, 8vw, 6rem) 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#fff', padding: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                <Image src="/logo.jpeg" alt="Logo" width={112} height={112} style={{ borderRadius: '50%', objectFit: 'cover' }} priority />
              </div>
            </div>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.18)', color: '#bfdbfe', padding: '.4rem 1rem', borderRadius: 99, fontSize: '.82rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '.03em' }}>
              ✦ OFFICIAL REGISTRATION PORTAL
            </span>

            <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.12, marginBottom: '1.25rem', letterSpacing: '-.02em' }}>
              Register Online,
              <br />
              <span style={{ color: '#93c5fd' }}>Track Your Status</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.175rem)', color: 'rgba(255,255,255,.75)', marginBottom: '2.5rem', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 2.5rem' }}>
              Submit your registration in minutes. Our admin team reviews and approves applications promptly. Track your status anytime using your phone number.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--blue-800)', boxShadow: '0 8px 30px rgba(0,0,0,.2)', gap: 8 }}>
                <UserPlus size={20} /> Start Registration
              </Link>
              <Link href="/status" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)', backdropFilter: 'blur(12px)', gap: 8 }}>
                <Search size={20} /> Check My Status
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[['Secure Portal', 'SSL Secured'], ['Review Time', '< 24 hrs'], ['Availability', '24 / 7']].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--blue-800)' }}>{val}</p>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '.625rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>Simple 4-step process — from submission to approval.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
                style={{ padding: '1.75rem', textAlign: 'center', transition: 'box-shadow .2s, transform .2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-800), var(--blue-500))', color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem' }}>
                  {s.num}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info cards ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: 'clamp(2rem, 5vw, 4rem) 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: MapPin, title: 'What Info Is Needed?', desc: 'Full name, parent/spouse name, address, area, PIN code, taluk, district, phone number, and email (optional).' },
            { icon: Phone, title: 'Track Your Registration', desc: 'Use your registered phone number at any time on the Status page to check if your application is pending, approved, or rejected.' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your personal data is encrypted and stored securely. Only authorised admin staff can access your registration details.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-50)', border: '1px solid var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color="var(--blue-700)" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '.375rem', fontSize: '.975rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: .97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="user-hero"
          style={{ maxWidth: 640, margin: '0 auto', borderRadius: 'var(--r-xl)', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Ready to Register?</h2>
          <p style={{ color: 'rgba(255,255,255,.78)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Takes less than 5 minutes. Fill in your details and submit securely online.
          </p>
          <Link href="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--blue-800)', display: 'inline-flex', gap: 8 }}>
            Start Registration <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="user-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '.625rem' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
            <Image src="/logo.jpeg" alt="Logo" width={24} height={24} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 700 }}>Kayaka Sampada</span>
        </div>
        <p>© {new Date().getFullYear()} Kayaka Sampada Farmer Producer Organisation. All rights reserved.</p>
        <div style={{ marginTop: '.75rem', display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
          <Link href="/register" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: '.82rem' }}>Register</Link>
          <Link href="/status" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: '.82rem' }}>Check Status</Link>
          <Link href="/admin/login" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: '.82rem' }}>Admin Login</Link>
        </div>
      </footer>
    </>
  );
}
