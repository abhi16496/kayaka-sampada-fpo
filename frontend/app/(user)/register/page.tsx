'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft, UserPlus, User, Users, Home,
  MapPin, Hash, Building, Phone, Mail, CheckCircle, X, ChevronRight, Sprout, Wheat, Printer
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
  email:              z.string().min(1, 'Email ID is required').email('Invalid email'),
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
  kannadaLabel: string;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
  tag?: 'textarea';
  hint?: string;
  optional?: boolean;
  fullWidth?: boolean;
}> = [
  { name: 'full_name',          label: 'Full Name',                    kannadaLabel: 'ಪೂರ್ಣ ಹೆಸರು',             placeholder: 'Enter your full name',         icon: User },
  { name: 'parent_spouse_name', label: 'Father / Spouse Name',         kannadaLabel: 'ತಂದೆ / ಸಂಗಾತಿಯ ಹೆಸರು',     placeholder: 'Enter name',                icon: Users },
  { name: 'full_address',       label: 'Full Address',                 kannadaLabel: 'ಪೂರ್ಣ ವಿಳಾಸ',             placeholder: 'Door no., Street, Locality...', icon: Home, tag: 'textarea', fullWidth: true },
  { name: 'area_village',       label: 'Area / Village',               kannadaLabel: 'ಪ್ರದೇಶ / ಗ್ರಾಮ',          placeholder: 'Enter area or village',        icon: MapPin },
  { name: 'pin_code',           label: 'PIN Code',                     kannadaLabel: 'ಪಿನ್ ಕೋಡ್',               placeholder: '6-digit PIN code',             icon: Hash, hint: '6 digits only' },
  { name: 'taluk',              label: 'Taluk / City',                 kannadaLabel: 'ತಾಲ್ಲೂಕು / ನಗರ',           placeholder: 'Enter taluk or city name',     icon: Building },
  { name: 'district',           label: 'District',                     kannadaLabel: 'ಜಿಲ್ಲೆ',                  placeholder: 'Enter district',               icon: Building },
  { name: 'state',              label: 'State',                        kannadaLabel: 'ರಾಜ್ಯ',                   placeholder: 'Enter state',                  icon: MapPin },
  { name: 'country',            label: 'Country',                      kannadaLabel: 'ದೇಶ',                    placeholder: 'Enter country',                icon: MapPin },
  { name: 'phone',              label: 'Mobile Number',                kannadaLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',           placeholder: '10-digit mobile number',       icon: Phone, type: 'tel', hint: 'Used to check status later' },
  { name: 'email',              label: 'Email ID',                     kannadaLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',             placeholder: 'your@email.com',               icon: Mail, type: 'email' },
];


export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [serverError, setServerError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
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
            if (city) setValue('taluk', city, { shouldValidate: true });
            if (district) setValue('district', district, { shouldValidate: true });
            if (state) setValue('state', state, { shouldValidate: true });
            if (country) setValue('country', country, { shouldValidate: true });
          }
        } catch (err: any) {
          console.warn('Backend geocoding failed. Attempting direct client-side Nominatim fallback...', err.message || err);
          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&country=India&format=json&addressdetails=1&accept-language=en`);
            if (response.data && response.data.length > 0 && response.data[0].address) {
              const address = response.data[0].address;
              const city = address.city || address.town || address.village || address.suburb || address.county || '';
              const district = address.state_district || address.county || '';
              const state = address.state || '';
              const country = address.country || 'India';

              if (city) setValue('taluk', city, { shouldValidate: true });
              if (district) setValue('district', district, { shouldValidate: true });
              if (state) setValue('state', state, { shouldValidate: true });
              if (country) setValue('country', country, { shouldValidate: true });
              
              setGeoError('');
            } else {
              throw new Error('Nominatim returned no matching records');
            }
          } catch (osmErr: any) {
            console.warn('Direct client-side Nominatim also failed. Trying Indian Post API fallback...', osmErr.message || osmErr);
            try {
              const response = await axios.get(`https://api.postalpincode.in/pincode/${pinCode}`);
              if (response.data && response.data[0] && response.data[0].Status === 'Success' && response.data[0].PostOffice && response.data[0].PostOffice.length > 0) {
                const po = response.data[0].PostOffice[0];
                const state = po.State;
                const district = po.District;
                const country = po.Country || 'India';
                const city = po.Block && po.Block !== 'NA' ? po.Block : (po.District || po.Name);

                if (city) setValue('taluk', city, { shouldValidate: true });
                if (district) setValue('district', district, { shouldValidate: true });
                if (state) setValue('state', state, { shouldValidate: true });
                if (country) setValue('country', country, { shouldValidate: true });
                
                setGeoError('');
              } else {
                const errorMsg = err.response?.data?.error || 'Failed to detect location. Please enter manually.';
                setGeoError(errorMsg);
              }
            } catch (fallbackErr: any) {
              console.error('Direct client-side Indian Post API fallback also failed:', fallbackErr.message || fallbackErr);
              const errorMsg = err.response?.data?.error || 'Failed to detect location. Please enter manually.';
              setGeoError(errorMsg);
            }
          }
        } finally {
          setGeoLoading(false);
        }
      }, 600);

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
    if (serverError) { setServerError(''); setIsDuplicate(false); }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    setIsDuplicate(false);
    try {
      const res = await axios.post(`${API_URL}/api/register`, data);
      setSuccess(res.data.registration);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMsg = err.response?.data?.error;
        if (!err.response) {
          setServerError('Unable to reach the server. Please check your internet connection and try again.');
        } else if (status === 409) {
          setIsDuplicate(true);
          setServerError(serverMsg || 'This mobile number is already registered.');
        } else if (status === 429) {
          setServerError('Too many registration attempts. Please wait a while and try again.');
        } else if (status === 400) {
          setServerError(serverMsg || 'Some fields are invalid. Please review your inputs and try again.');
        } else if (status && status >= 500) {
          setServerError('Server error. Please try again in a few minutes.');
        } else {
          setServerError(serverMsg || 'Registration failed. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
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
            <span style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>FPO REGISTRATION</span>
          </div>
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
      <div className="user-hero" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Member Application Form</span>
          <h1 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', fontWeight: 700, color: '#fff', marginTop: '.25rem', marginBottom: '.5rem' }}>
            FPO Membership Enrollment
          </h1>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: '.95rem', maxWidth: 480, margin: '0 auto' }}>
            ಕಾಯಕ ಸಂಪಾದ ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ ನೋಂದಣಿ. All fields are mandatory (ಎಲ್ಲಾ ವಿವರಗಳು ಕಡ್ಡಾಯ).
          </p>
        </motion.div>
      </div>

      {/* ── Form ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--primary-emerald)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <span style={{ opacity: .8 }}>FPO Membership Enrollment Form</span>
          </div>

          <div className="card card-textured" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', borderTop: '4px solid var(--primary-forest)' }}>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-bdr)', borderRadius: 12, padding: '1.15rem', marginBottom: '1.75rem', display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}
                >
                  <X size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '.9rem', marginBottom: 4 }}>
                      {isDuplicate ? 'Mobile Already Enrolled (ಮೊಬೈಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ)' : 'Submission Error'}
                    </p>
                    <p style={{ color: 'var(--danger)', fontSize: '.875rem', lineHeight: 1.5 }}>{serverError}</p>
                    {isDuplicate && (
                      <Link href="/status" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, color: 'var(--danger)', fontWeight: 700, fontSize: '.84rem', textDecoration: 'underline' }}>
                        Check your verification status here →
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {FIELDS.map((field) => (
                  <div key={field.name} style={{ gridColumn: field.fullWidth ? '1 / -1' : undefined }}>
                    <label className="form-label" htmlFor={field.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{field.label}</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--text-light)', fontWeight: 500, fontStyle: 'italic' }}>
                        {field.kannadaLabel}
                      </span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <field.icon size={16} style={{ position: 'absolute', left: 14, top: field.tag === 'textarea' ? 16 : '50%', transform: field.tag === 'textarea' ? 'none' : 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
                      {field.tag === 'textarea' ? (
                        <textarea
                          id={field.name}
                          {...register(field.name)}
                          onChange={e => { register(field.name).onChange(e); handleChange(field.name, e.target.value); }}
                          className={`form-input${errors[field.name] ? ' error' : ''}`}
                          style={{ paddingLeft: 42, minHeight: 100, resize: 'vertical' }}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={field.type || 'text'}
                          {...register(field.name)}
                          onChange={e => { register(field.name).onChange(e); handleChange(field.name, e.target.value); }}
                          className={`form-input${errors[field.name] ? ' error' : ''}`}
                          style={{ paddingLeft: 42 }}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                    {errors[field.name] && <p className="form-error">⚠️ {errors[field.name]?.message}</p>}
                    {field.name === 'pin_code' && geoLoading && (
                      <p style={{ fontSize: '.78rem', color: 'var(--primary-emerald)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                        <span className="spinner-inline" /> Retrieving regional address...
                      </p>
                    )}
                    {field.name === 'pin_code' && geoError && (
                      <p style={{ fontSize: '.78rem', color: '#c05c1e', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        ⚠️ {geoError}
                      </p>
                    )}
                    {field.hint && !errors[field.name] && (field.name !== 'pin_code' || (!geoLoading && !geoError)) && (
                      <p style={{ fontSize: '.78rem', color: 'var(--text-light)', marginTop: 4, opacity: 0.85 }}>{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Notice */}
              <div style={{ marginTop: '2rem', background: 'var(--success-bg)', border: '1px solid var(--success-bdr)', borderRadius: 12, padding: '1.15rem', fontSize: '.9rem', color: 'var(--success)', lineHeight: 1.6 }}>
                <strong>FPO Membership Terms:</strong> By submitting, you apply to the Kayaka Sampada FPO administrative committee. Verification completes in 24 hours. Track status using your mobile number.
              </div>

              <button
                id="submit-registration"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {loading ? <><div className="spinner" /> Verification in progress...</> : <><UserPlus size={20} /> Register & Apply for Membership</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── Success Modal (Bespoke FPO Paper Receipt) ───────────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <div className="modal-overlay">
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: .92, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .93 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ padding: 0, overflow: 'hidden' }}
            >
              {/* Paper receipt container */}
              <div className="receipt-card" style={{ margin: '1.5rem' }}>
                {/* Stamp overlay */}
                <div className="stamp-pending">Committee Review</div>

                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-sage)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .75rem' }}>
                    <CheckCircle size={24} color="var(--success)" />
                  </div>
                  <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-forest)' }}>
                    Membership Application Receipt
                  </h2>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>
                    ಕಾಯಕ ಸಂಪಾದ ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ
                  </p>
                </div>

                {/* Details */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: 8 }}>
                  Your application is filed securely. Please print or save this token. You will need your registered mobile number to check the committee approval status.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2rem' }}>
                  {[
                    ['Application ID', success.registration_id],
                    ['Farmer Name', success.full_name],
                    ['Filing Date', new Date(success.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
                    ['Verification Stage', 'Pending FPO Board Review'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '.65rem', borderBottom: '1px solid rgba(18, 53, 36, 0.05)' }}>
                      <span style={{ color: 'var(--text-light)', fontSize: '.84rem', fontWeight: 600 }}>{l}</span>
                      <span style={{ fontWeight: l === 'Application ID' ? 800 : 700, color: l === 'Application ID' ? 'var(--primary-emerald)' : 'var(--text-primary)', fontSize: '.9rem', fontFamily: l === 'Application ID' ? 'monospace' : 'inherit' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Receipt Actions */}
                <div style={{ display: 'flex', gap: '.85rem', justifyContent: 'center', flexWrap: 'wrap', borderTop: '2px dashed var(--border-sage)', paddingTop: '1.5rem' }} className="no-print">
                  <button onClick={() => window.print()} className="btn btn-outline" style={{ display: 'flex', gap: 6 }}>
                    <Printer size={16} /> Print Receipt
                  </button>
                  <Link href="/status" className="btn btn-primary">Check Approval Status</Link>
                  <Link href="/" className="btn btn-ghost">Home</Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
