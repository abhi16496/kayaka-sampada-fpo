'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import {
  FileText, ArrowLeft, UserPlus, User, Users, Home,
  MapPin, Hash, Building, Phone, Mail, CheckCircle, X, ChevronRight
} from 'lucide-react';

const API_URL = '';

const schema = z.object({
  full_name:          z.string().min(3, 'Full name must be at least 3 characters'),
  parent_spouse_name: z.string().min(3, 'This field must be at least 3 characters'),
  full_address:       z.string().min(10, 'Please enter a complete address'),
  area_village:       z.string().min(2, 'Area / Village is required'),
  pin_code:           z.string().regex(/^\d{6}$/, 'Must be exactly 6 digits'),
  taluk:              z.string().min(2, 'Taluk / City is required'),
  district:           z.string().min(2, 'District is required'),
  state:              z.string().min(2, 'State is required'),
  country:            z.string().min(2, 'Country is required'),
  phone:              z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email:              z.string().email('Invalid email').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface SuccessData {
  registration_id: string;
  full_name: string;
  submitted_at: string;
}

const FIELDS: Array<{
  name: keyof FormData;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
  tag?: 'textarea';
  hint?: string;
  optional?: boolean;
  fullWidth?: boolean;
}> = [
  { name: 'full_name',          label: 'Full Name',                    placeholder: 'Enter your full name',         icon: User },
  { name: 'parent_spouse_name', label: 'Father / Mother / Husband Name', placeholder: 'Enter name',                icon: Users },
  { name: 'full_address',       label: 'Full Address',                 placeholder: 'Door no., Street, Locality...', icon: Home, tag: 'textarea', fullWidth: true },
  { name: 'area_village',       label: 'Area / Village',               placeholder: 'Enter area or village',        icon: MapPin },
  { name: 'pin_code',           label: 'PIN Code',                     placeholder: '6-digit PIN code',             icon: Hash, hint: '6 digits only' },
  { name: 'taluk',              label: 'Taluk / City',                 placeholder: 'Enter taluk or city name',     icon: Building },
  { name: 'district',           label: 'District',                     placeholder: 'Enter district',               icon: Building },
  { name: 'state',              label: 'State',                        placeholder: 'Enter state',                  icon: MapPin },
  { name: 'country',            label: 'Country',                      placeholder: 'Enter country',                icon: MapPin },
  { name: 'phone',              label: 'Mobile Number',                placeholder: '10-digit mobile number',       icon: Phone, type: 'tel', hint: 'Used to check status later' },
  { name: 'email',              label: 'Email ID',                     placeholder: 'your@email.com',               icon: Mail, type: 'email', optional: true },
];

const UC_FIELDS: (keyof FormData)[] = ['full_name', 'parent_spouse_name', 'full_address', 'area_village', 'taluk', 'district', 'state', 'country'];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [serverError, setServerError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pinCode = watch('pin_code');

  useEffect(() => {
    if (!pinCode) {
      setGeoError('');
      return;
    }

    if (/^\d{6}$/.test(pinCode)) {
      setGeoError('');
      setGeoLoading(true);

      const delayDebounceFn = setTimeout(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/geocode/${pinCode}`);
          if (response.data) {
            const { city, district, state, country } = response.data;
            if (city) setValue('taluk', city.toUpperCase(), { shouldValidate: true });
            if (district) setValue('district', district.toUpperCase(), { shouldValidate: true });
            if (state) setValue('state', state.toUpperCase(), { shouldValidate: true });
            if (country) setValue('country', country.toUpperCase(), { shouldValidate: true });
          }
        } catch (err: any) {
          console.error('Error fetching geocode info:', err);
          const errorMsg = err.response?.data?.error || 'Failed to detect location. Please enter manually.';
          setGeoError(errorMsg);
        } finally {
          setGeoLoading(false);
        }
      }, 600); // 600ms debounce

      return () => clearTimeout(delayDebounceFn);
    } else {
      setGeoLoading(false);
      if (pinCode.length > 0 && !/^\d+$/.test(pinCode)) {
        setGeoError('PIN Code must contain digits only');
      } else {
        setGeoError('');
      }
    }
  }, [pinCode, setValue]);

  const handleChange = (name: keyof FormData, value: string) => {
    if (UC_FIELDS.includes(name)) {
      setValue(name, value.toUpperCase() as never, { shouldValidate: false });
    }
  };


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await axios.post(`${API_URL}/api/register`, data);
      setSuccess(res.data.registration);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setServerError('Registration failed. Please try again.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <Link href="/status" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Check Status
          </Link>
          <Link href="/" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      {/* ── Page banner ─────────────────────────────────────────── */}
      <div className="user-hero" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, color: '#fff', marginBottom: '.5rem' }}>
            New Registration
          </h1>
          <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '1rem' }}>
            Fill in all required fields. Fields marked <span style={{ color: '#fca5a5' }}>*</span> are mandatory.
          </p>
        </motion.div>
      </div>

      {/* ── Form ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem 5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--blue-600)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <span>Registration Form</span>
          </div>

          <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-bdr)', borderRadius: 10, padding: '1rem 1.125rem', marginBottom: '1.5rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}
                >
                  <X size={17} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '.9rem', marginBottom: 3 }}>Submission Error</p>
                    <p style={{ color: 'var(--danger)', fontSize: '.875rem' }}>{serverError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {FIELDS.map((field) => (
                  <div key={field.name} style={{ gridColumn: field.fullWidth ? '1 / -1' : undefined }}>
                    <label className="form-label" htmlFor={field.name}>
                      {field.label}
                      {!field.optional && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
                      {field.optional && <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>(Optional)</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <field.icon size={16} style={{ position: 'absolute', left: 12, top: field.tag === 'textarea' ? 14 : '50%', transform: field.tag === 'textarea' ? 'none' : 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      {field.tag === 'textarea' ? (
                        <textarea
                          id={field.name}
                          {...register(field.name)}
                          onChange={e => { register(field.name).onChange(e); handleChange(field.name, e.target.value); }}
                          className={`form-input${errors[field.name] ? ' error' : ''}`}
                          style={{ paddingLeft: 38, minHeight: 90, resize: 'vertical' }}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={field.type || 'text'}
                          {...register(field.name)}
                          onChange={e => { register(field.name).onChange(e); handleChange(field.name, e.target.value); }}
                          className={`form-input${errors[field.name] ? ' error' : ''}`}
                          style={{ paddingLeft: 38 }}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                    {errors[field.name] && <p className="form-error">{errors[field.name]?.message}</p>}
                    {field.name === 'pin_code' && geoLoading && (
                      <p style={{ fontSize: '.78rem', color: 'var(--blue-600)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="spinner-inline" /> Auto-detecting location...
                      </p>
                    )}
                    {field.name === 'pin_code' && geoError && (
                      <p style={{ fontSize: '.78rem', color: '#d97706', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ⚠️ {geoError}
                      </p>
                    )}
                    {field.hint && !errors[field.name] && (field.name !== 'pin_code' || (!geoLoading && !geoError)) && (
                      <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Notice */}
              <div style={{ marginTop: '1.75rem', background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 10, padding: '.875rem 1.125rem', fontSize: '.875rem', color: 'var(--blue-800)', lineHeight: 1.65 }}>
                <strong>Note:</strong> After submission, your application enters a <strong>Pending Approval</strong> state. An admin will review it within 24 hours. Save your <strong>Registration ID</strong> to check status later.
              </div>

              <button
                id="submit-registration"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1.75rem' }}
              >
                {loading ? <><div className="spinner" /> Submitting...</> : <><UserPlus size={19} /> Submit Registration</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── Success Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <div className="modal-overlay">
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: .88, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={{ padding: '2.75rem 2.25rem', textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: .18, type: 'spring', stiffness: 400 }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', border: '2.5px solid var(--success-bdr)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
              >
                <CheckCircle size={34} color="var(--success)" />
              </motion.div>

              <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '.75rem' }}>
                Registration Submitted!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '.975rem', lineHeight: 1.7 }}>
                Your registration is submitted successfully and is <strong>waiting for admin approval</strong>.
              </p>

              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                {[
                  ['Registration ID', success.registration_id],
                  ['Name', success.full_name],
                  ['Submitted At', new Date(success.submitted_at).toLocaleString('en-IN')],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '.4rem 0', borderBottom: l !== 'Submitted At' ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>{l}</span>
                    <span style={{ fontWeight: l === 'Registration ID' ? 800 : 600, color: l === 'Registration ID' ? 'var(--blue-700)' : 'var(--text-primary)', fontSize: l === 'Registration ID' ? '1rem' : '.9rem', letterSpacing: l === 'Registration ID' ? '.03em' : 0 }}>{v}</span>
                  </div>
                ))}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '.84rem', marginBottom: '1.5rem' }}>
                📌 Please note your Registration ID: <strong style={{ color: 'var(--blue-700)' }}>{success.registration_id}</strong>
              </p>

              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/status" className="btn btn-primary">Check Status</Link>
                <Link href="/" className="btn btn-ghost">Back to Home</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
