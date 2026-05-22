'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Lock, User, Eye, EyeOff, Shield, FileText, ArrowLeft } from 'lucide-react';

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
        setError(err.response?.data?.error || 'Invalid credentials');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e293b 70%, #0f2044 100%)', position: 'relative', overflow: 'hidden' }}>

      {/* Background glows */}
      <div style={{ position: 'absolute', top: '8%', right: '12%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,64,175,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,40,80,.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Top bar — link back to user site */}
      <div style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={15} color="rgba(255,255,255,.7)" />
          </div>
          <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.85rem', fontWeight: 600 }}>Kayaka Sampada</span>
          <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '.85rem' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '.85rem' }}>Admin</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.35)', fontSize: '.82rem', textDecoration: 'none', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.35)')}>
          <ArrowLeft size={13} /> User Site
        </Link>
      </div>

      {/* Login card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 28, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .5 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: .2, type: 'spring', stiffness: 380 }}
              style={{ width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg, var(--blue-700), var(--blue-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem', boxShadow: '0 8px 32px rgba(37,99,235,.4)' }}
            >
              <Shield size={30} color="#fff" />
            </motion.div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#fff', marginBottom: '.3rem', letterSpacing: '-.02em' }}>
              Admin Panel
            </h1>
            <p style={{ color: 'rgba(255,255,255,.42)', fontSize: '.9rem' }}>
              Sign in with your admin credentials
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 20, padding: '2.25rem', boxShadow: '0 25px 60px rgba(0,0,0,.45)' }}>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ background: 'rgba(220,38,38,.15)', border: '1px solid rgba(220,38,38,.3)', borderRadius: 10, padding: '.875rem 1rem', marginBottom: '1.25rem', color: '#fca5a5', fontSize: '.875rem', lineHeight: 1.5 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Username */}
              <div style={{ marginBottom: '1.125rem' }}>
                <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: '.375rem', letterSpacing: '.03em' }}>
                  USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.28)' }} />
                  <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    {...register('username', { required: 'Username is required' })}
                    style={{
                      width: '100%',
                      padding: '.8rem 1rem .8rem 38px',
                      background: 'rgba(255,255,255,.06)',
                      border: `1.5px solid ${errors.username ? 'rgba(220,38,38,.5)' : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: '.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                    placeholder="Enter username"
                    onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.username ? 'rgba(220,38,38,.5)' : 'rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.username && <p style={{ color: '#fca5a5', fontSize: '.78rem', marginTop: 4 }}>{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: '.375rem', letterSpacing: '.03em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.28)' }} />
                  <input
                    id="admin-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password', { required: 'Password is required' })}
                    style={{
                      width: '100%',
                      padding: '.8rem 40px .8rem 38px',
                      background: 'rgba(255,255,255,.06)',
                      border: `1.5px solid ${errors.password ? 'rgba(220,38,38,.5)' : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: '.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                    placeholder="Enter password"
                    onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'rgba(220,38,38,.5)' : 'rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.32)', padding: 3, display: 'flex' }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#fca5a5', fontSize: '.78rem', marginTop: 4 }}>{errors.password.message}</p>}
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '.9rem',
                  borderRadius: 12,
                  background: loading ? 'rgba(37,99,235,.5)' : 'linear-gradient(135deg, var(--blue-600), var(--blue-700))',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.5rem',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,.45)',
                  transition: 'all .2s',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? <><div className="spinner" />Signing in...</> : <>Sign In to Admin Panel</>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: '.8rem', marginTop: '1.5rem' }}>
            Not an admin?{' '}
            <Link href="/" style={{ color: 'rgba(147,197,253,.5)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(147,197,253,.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(147,197,253,.5)')}>
              Go to Registration Portal
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
