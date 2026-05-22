import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | Kayaka Sampada',
    default: 'Kayaka Sampada — Online Registration Portal',
  },
  description: 'Submit your registration online and track your approval status. Official member registration portal for Kayaka Sampada Farmer Producer Organisation.',
  keywords: ['fpo registration', 'kayaka sampada', 'apply online', 'farmer registration portal', 'member registration'],
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="user-site" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  );
}
