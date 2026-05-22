import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Kayaka Sampada Admin',
    default: 'Admin Panel | Kayaka Sampada',
  },
  description: 'Admin panel for managing registrations, approvals, and rejections for Kayaka Sampada.',
  robots: 'noindex, nofollow',   // prevent search indexing of admin
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  );
}
