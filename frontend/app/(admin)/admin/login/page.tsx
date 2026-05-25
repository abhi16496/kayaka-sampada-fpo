'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Lock, User, Eye, EyeOff, Shield, ArrowLeft, Sprout } from 'lucide-react';

const API_URL = '';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ username: string; password: string }>();

  const onSubmit = async (data: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, data);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Cannot connect to server. Make sure the backend is running on port 5000.');
        } else if (err.response.status === 401) {
          setError('Incorrect username or password. Please try again.');
        } else if (err.response.status === 429) {
          setError('Too many login attempts. Please wait and try again.');
        } else {
          setError(err.response.data?.error || 'Login failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #09120c 0%, #122218 50%, #1a3223 100%)', position: 'relative', overflow: 'hidden' }}>

      {/* Background warm sun glows */}
      <div style={{ position: 'absolute', top: '8%', right: '12%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,152,25,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,111,64,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(18,53,36,.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={16} color="var(--accent-amber)" />
          </div>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.84rem', fontWeight: 700, letterSpacing: '.02em' }}>ಕಾಯಕ ಸಂಪಾದ</span>
          <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '.85rem' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,.38)', fontSize: '.84rem', fontWeight: 600 }}>Secretariat Vault</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.38)', fontSize: '.82rem', textDecoration: 'none', transition: 'color .2s', fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.38)')}>
          <ArrowLeft size={13} /> Farmer Portal
        </Link>
      </div>

      {/* Login card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .5 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: .15, type: 'spring', stiffness: 360 }}
              style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary-forest), var(--primary-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(18,53,36,.35)' }}
            >
              <Shield size={28} color="var(--accent-amber)" />
            </motion.div>
            <h1 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '.35rem', letterSpacing: '-.01em' }}>
              FPO Board Secretariat
            </h1>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500 }}>
              Authorized committee credentials required
            </p>
          </div>

          {/* Glass Card */}
          <div style={{ background: 'rgba(18,53,36,.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 24, padding: '2.25rem', boxShadow: '0 30px 60px rgba(0,0,0,.35)' }}>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ background: 'rgba(185,44,44,.15)', border: '1px solid rgba(185,44,44,.3)', borderRadius: 12, padding: '.875rem 1rem', marginBottom: '1.25rem', color: '#ffb3b3', fontSize: '.875rem', lineHeight: 1.5, fontWeight: 500 }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Username */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: '.45rem', letterSpacing: '.06em' }}>
                  ADMIN SECURITY KEY
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.28)' }} />
                  <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    {...register('username', { required: 'Security Key is required' })}
                    style={{
                      width: '100%',
                      padding: '.85rem 1.15rem .85rem 42px',
                      background: 'rgba(255,255,255,.04)',
                      border: `1.5px solid ${errors.username ? 'rgba(185,44,44,.4)' : 'rgba(255,255,255,.08)'}`,
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: '.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'all .25s',
                    }}
                    placeholder="Enter security key"
                    onFocus={e => { e.target.style.borderColor = 'var(--accent-amber)'; e.target.style.boxShadow = '0 0 0 3px rgba(229,152,25,.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.username ? 'rgba(185,44,44,.4)' : 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.username && <p style={{ color: '#ffb3b3', fontSize: '.78rem', marginTop: 4, fontWeight: 600 }}>{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.85rem' }}>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: '.45rem', letterSpacing: '.06em' }}>
                  VAULT PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.28)' }} />
                  <input
                    id="admin-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password', { required: 'Vault Password is required' })}
                    style={{
                      width: '100%',
                      padding: '.85rem 42px .85rem 42px',
                      background: 'rgba(255,255,255,.04)',
                      border: `1.5px solid ${errors.password ? 'rgba(185,44,44,.4)' : 'rgba(255,255,255,.08)'}`,
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: '.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'all .25s',
                    }}
                    placeholder="Enter vault password"
                    onFocus={e => { e.target.style.borderColor = 'var(--accent-amber)'; e.target.style.boxShadow = '0 0 0 3px rgba(229,152,25,.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'rgba(185,44,44,.4)' : 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.32)', padding: 3, display: 'flex' }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#ffb3b3', fontSize: '.78rem', marginTop: 4, fontWeight: 600 }}>{errors.password.message}</p>}
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '.9rem',
                  borderRadius: 12,
                  background: loading ? 'rgba(18,53,36,.5)' : 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.5rem',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(194,120,3,.3)',
                  transition: 'all .2s',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? <><div className="spinner" /> Unlocking...</> : <>Unlock Secretariat Vault</>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: '.8rem', marginTop: '1.75rem', fontWeight: 500 }}>
            Not an authorized secretary?{' '}
            <Link href="/" style={{ color: 'rgba(229,152,25,.5)', textDecoration: 'none', transition: 'color .2s', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(229,152,25,.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(229,152,25,.5)')}>
              Go back to Farmer Portal
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

