'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, UserPlus, Search, Clock, CheckCircle,
  Shield, Phone, MapPin, ArrowRight, Sprout, Wheat
} from 'lucide-react';

const steps = [
  { num: '01', icon: FileText,    title: 'Fill the Form',   desc: 'Enter your personal details and agricultural profile accurately.' },
  { num: '02', icon: UserPlus,    title: 'Submit Application', desc: 'Securely submit. You will receive a unique Farmer Registration ID instantly.' },
  { num: '03', icon: Clock,       title: 'FPO Verification',   desc: 'Our local administration committee reviews your member credentials.' },
  { num: '04', icon: CheckCircle, title: 'Active Membership',  desc: 'Unlock direct market access, bulk seed/fertilizer subsidies, and rental equipment.' },
];

export default function UserHomePage() {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="user-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary-forest),var(--primary-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(18,53,36,0.15)' }}>
            <Sprout size={20} color="#fff" />
          </div>
          <div>
            <p className="font-serif" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ಕಾಯಕ ಸಂಪಾದ <span style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--primary-emerald)' }}>FPO</span>
            </p>
            <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 600 }}>Farmer Producer Organisation</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '.85rem', alignItems: 'center' }}>
          <Link href="/status" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', fontSize: '.9rem', padding: '.45rem .9rem', borderRadius: 'var(--r-sm)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(18,53,36,0.04)'; e.currentTarget.style.color = 'var(--primary-forest)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <Search size={15} /> Check Status
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Join FPO
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="user-hero" style={{ padding: 'clamp(4.5rem, 10vw, 7.5rem) 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Organic decorative curves */}
        <div style={{ position: 'absolute', top: -180, right: -100, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,152,25,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,111,64,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.09)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.14)', color: '#fae8ff', padding: '.45rem 1.15rem', borderRadius: 99, fontSize: '.8rem', fontWeight: 700, marginBottom: '1.75rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              🌱 Official Member Enrollment Portal • ಕಾಯಕ ಸಂಪಾದ ಸಂಸ್ಥೆ
            </span>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2.15rem, 5.8vw, 3.85rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-.01em' }}>
              Grow Your Farming Wealth
              <br />
              <span style={{ color: 'var(--accent-amber)' }}>Register to Join Our FPO Collective</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2.3vw, 1.15rem)', color: 'rgba(255,255,255,.82)', marginBottom: '2.75rem', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 2.75rem' }}>
              Access direct crop sell-back networks, expert agronomy guidance, and government schemes. Enter your details and track verification instantly.
            </p>

            <div style={{ display: 'flex', gap: '1.15rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-lg btn-accent" style={{ color: '#fff', gap: 8 }}>
                <Wheat size={20} /> Register Online (ಸದಸ್ಯರಾಗಿ)
              </Link>
              <Link href="/status" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                <Search size={20} /> Track My Status
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Genuine FPO Trust Bar ─────────────────────────────── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            ['NABARD Assisted FPO', 'National Bank Support'],
            ['5,000+ Local Farmers', 'Strong Cooperative Network'],
            ['Direct Market Buybacks', 'Fair Minimum Pricing Support']
          ].map(([label, val]) => (
            <div key={label} style={{ padding: '.5rem 1rem' }}>
              <p className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-forest)' }}>{label}</p>
              <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.02em' }}>{val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4.5rem, 8vw, 6.5rem) 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--primary-emerald)', fontWeight: 800, fontSize: '.84rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Simple Integration Flow</span>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '.5rem', marginBottom: '.75rem' }}>How FPO Membership Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>Join the collective in 4 straightforward steps and unlock member facilities.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                className="card card-textured"
                style={{ padding: '2rem 1.75rem', transition: 'all .25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-sage)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(46,111,64,0.07)', color: 'var(--primary-emerald)', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {s.num}
                </div>
                <h3 className="font-serif" style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '.625rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info Cards (Custom & Localized) ────────────────────── */}
      <section style={{ background: '#ffffff', padding: 'clamp(3.5rem, 7vw, 5.5rem) 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {[
              { icon: Sprout, title: 'Why Register with Kayaka Sampada?', desc: 'Members get bulk seeds, organic fertilizers at discounted rates, shared combine harvesters, and direct linkages to cold chain storages.' },
              { icon: Phone, title: 'Instant Application Tracking', desc: 'Verify your membership anytime. Use your mobile number to view status updates, official verification remarks, and dynamic certificates.' },
              { icon: Shield, title: 'Farmer Privacy & Protection', desc: 'Your crop yields and personal data are safely managed. We store registrations under strict national agricultural portal compliance guidelines.' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(46,111,64,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--primary-emerald)" />
                </div>
                <div>
                  <h3 className="font-serif" style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '.5rem', fontSize: '1.1rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.92rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4.5rem, 8vw, 6.5rem) 1.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: .98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="user-hero"
          style={{ maxWidth: 800, margin: '0 auto', borderRadius: 'var(--r-xl)', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <span style={{ color: 'var(--accent-amber)', fontSize: '.84rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: '.75rem' }}>Start Today</span>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>Ready to Secure Your Membership?</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '2.5rem', fontSize: '1.08rem', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            It takes just a few minutes to submit your details. Support our rural cooperative ecosystem.
          </p>
          <Link href="/register" className="btn btn-lg btn-accent" style={{ color: '#fff', display: 'inline-flex', gap: 8 }}>
            Start Member Registration <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="user-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '1rem' }}>
          <Sprout size={18} color="var(--accent-amber)" />
          <span className="font-serif" style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.15rem' }}>ಕಾಯಕ ಸಂಪಾದ ಸಂಸ್ಥೆ</span>
        </div>
        <p style={{ fontSize: '.84rem', opacity: .8, maxWidth: 540, margin: '0 auto .75rem', lineHeight: 1.65 }}>
          Kayaka Sampada Farmer Producer Organisation (FPO) collective. Empowering farmers with technology and collaborative growth networks.
        </p>
        <p style={{ fontSize: '.78rem', opacity: .4 }}>© {new Date().getFullYear()} Kayaka Sampada FPO. All rights reserved.</p>
        <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/register" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}>Register</Link>
          <Link href="/status" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}>Check Status</Link>
          <Link href="/admin/login" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.3)'}>Admin Login</Link>
        </div>
      </footer>
    </>
  );
}

