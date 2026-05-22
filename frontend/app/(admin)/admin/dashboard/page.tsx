'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, Clock, CheckCircle, XCircle, LogOut,
  Search, Download, Eye, ChevronLeft, ChevronRight,
  Menu, X, FileText, Activity, RefreshCw, AlertCircle,
  TrendingUp, Calendar, ExternalLink
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Registration {
  id: string; registration_id: string; full_name: string; parent_spouse_name: string;
  full_address: string; area_village: string; pin_code: string; taluk: string;
  district: string; state: string; country: string; phone: string; email?: string; status: 'pending' | 'approved' | 'rejected';
  submitted_at: string; reviewed_at?: string; reviewed_by_name?: string;
  rejection_reason?: string; notes?: string;
}
interface Stats { total: string; pending: string; approved: string; rejected: string; today: string; }
interface ActivityLog { action: string; details: string; created_at: string; admin_name: string; registration_id?: string; }

type Section = 'dashboard' | 'pending' | 'approved' | 'rejected' | 'all' | 'logs';

const STATUS_COLORS = {
  pending:  { badge: 'badge-pending',  dot: 'var(--warning)' },
  approved: { badge: 'badge-approved', dot: 'var(--success)' },
  rejected: { badge: 'badge-rejected', dot: 'var(--danger)' },
};

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection]   = useState<Section>('dashboard');
  const [sidebarOpen, setSidebar] = useState(false);
  const [stats, setStats]        = useState<Stats | null>(null);
  const [registrations, setRegs] = useState<Registration[]>([]);
  const [logs, setLogs]          = useState<ActivityLog[]>([]);
  const [chartData, setChart]    = useState<{ date: string; count: number }[]>([]);
  const [total, setTotal]        = useState(0);
  const [page, setPage]          = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]      = useState('');
  const [loading, setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy]      = useState('submitted_at');
  const [sortOrder, setSortOrder]= useState('DESC');
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user  = localStorage.getItem('adminUser');
    if (!token) { router.push('/admin/login'); return; }
    if (user) setAdminUser(JSON.parse(user));
  }, [router]);

  // ── Fetch dashboard ──────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard`, { headers: authHeaders() });
      setStats(res.data.stats);
      setLogs(res.data.recentActivity);
      setChart(res.data.chartData);
    } catch { toast.error('Failed to load dashboard data'); }
  }, []);

  // ── Fetch registrations ──────────────────────────────────────
  const fetchRegs = useCallback(async (sec: Section, pg: number, q: string, sb: string, so: string) => {
    if (sec === 'dashboard' || sec === 'logs') return;
    setLoading(true);
    const statusMap: Record<string, string> = { pending: 'pending', approved: 'approved', rejected: 'rejected', all: '' };
    try {
      const res = await axios.get(`${API_URL}/api/admin/registrations`, {
        params: { status: statusMap[sec] ?? '', search: q, page: pg, limit: 10, sortBy: sb, sortOrder: so },
        headers: authHeaders(),
      });
      setRegs(res.data.registrations);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load registrations'); }
    finally { setLoading(false); }
  }, []);

  // ── Fetch logs ────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/logs`, { headers: authHeaders() });
      setLogs(res.data.logs);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    if (section === 'logs') { fetchLogs(); return; }
    fetchRegs(section, page, search, sortBy, sortOrder);
  }, [section, page, sortBy, sortOrder, fetchRegs, fetchLogs]);

  const handleSearch = () => { setPage(1); fetchRegs(section, 1, search, sortBy, sortOrder); };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchRegs(section, page, search, sortBy, sortOrder)]);
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setSortOrder('DESC');
    }
  };

  // ── Approve ───────────────────────────────────────────────────
  const approve = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/registrations/${id}/approve`, {}, { headers: authHeaders() });
      toast.success('Registration approved!');
      setSelectedReg(res.data.registration);
      fetchDashboard(); fetchRegs(section, page, search, sortBy, sortOrder);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error || 'Approval failed' : 'Approval failed');
    } finally { setActionLoading(false); }
  };

  // ── Reject ────────────────────────────────────────────────────
  const reject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/registrations/${id}/reject`,
        { rejection_reason: rejectReason }, { headers: authHeaders() });
      toast.success('Registration rejected');
      setSelectedReg(res.data.registration); setRejectReason(''); setShowRejectInput(false);
      fetchDashboard(); fetchRegs(section, page, search, sortBy, sortOrder);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error || 'Rejection failed' : 'Rejection failed');
    } finally { setActionLoading(false); }
  };

  // ── Mark Pending ──────────────────────────────────────────────
  const markPending = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/registrations/${id}/pending`, {}, { headers: authHeaders() });
      toast.success('Registration moved to pending');
      setSelectedReg(res.data.registration);
      fetchDashboard(); fetchRegs(section, page, search, sortBy, sortOrder);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error || 'Action failed' : 'Action failed');
    } finally { setActionLoading(false); }
  };

  // ── Export ────────────────────────────────────────────────────
  const exportCSV = async (filterStatus?: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/export`, {
        params: { status: filterStatus || '' }, headers: authHeaders(), responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `registrations-${Date.now()}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const navItems: Array<{ key: Section; label: string; icon: React.ElementType; count?: string }> = [
    { key: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { key: 'all',       label: 'All Registrations', icon: Users,    count: stats?.total },
    { key: 'pending',   label: 'Pending',        icon: Clock,       count: stats?.pending },
    { key: 'approved',  label: 'Approved',       icon: CheckCircle, count: stats?.approved },
    { key: 'rejected',  label: 'Rejected',       icon: XCircle,     count: stats?.rejected },
    { key: 'logs',      label: 'Activity Logs',  icon: Activity },
  ];

  const navigate = (key: Section) => {
    setSection(key); setPage(1); setSearch(''); setSidebar(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.375rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: '#fff', fontSize: '.95rem', lineHeight: 1.1 }}>Kayaka Sampada</p>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.7rem', letterSpacing: '.04em' }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue-700),var(--blue-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '.875rem' }}>
              {adminUser?.username?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser?.username || 'Admin'}</p>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.72rem' }}>Administrator</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.625rem 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              id={`nav-${item.key}`}
              onClick={() => navigate(item.key)}
              className={`admin-nav-link${section === item.key ? ' active' : ''}`}
            >
              <item.icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ background: section === item.key ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)', color: '#fff', borderRadius: 99, padding: '.1rem .5rem', fontSize: '.75rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '.75rem', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <Link href="/" className="admin-nav-link" style={{ marginBottom: '.25rem' }} target="_blank">
            <ExternalLink size={16} />
            <span>User Site</span>
          </Link>
          <button id="admin-logout" onClick={logout} className="admin-nav-link">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 35 }} />}

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 256, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebar(true)}
              id="mobile-menu-btn"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {navItems.find(n => n.key === section)?.label}
              </h1>
              <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.625rem', alignItems: 'center' }}>
            <button id="refresh-btn" onClick={refresh} className="btn btn-ghost btn-sm" style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin .8s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button id="export-btn" onClick={() => exportCSV()} className="btn btn-outline btn-sm" style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </header>

        {/* ── Page body ──────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>

          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <div>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total',   value: stats?.total   || '—', icon: Users,        color: 'var(--blue-700)', bg: 'var(--blue-50)',    key: 'all' as Section },
                  { label: 'Pending', value: stats?.pending  || '—', icon: Clock,        color: 'var(--warning)', bg: 'var(--warning-bg)', key: 'pending' as Section },
                  { label: 'Approved',value: stats?.approved || '—', icon: CheckCircle,  color: 'var(--success)', bg: 'var(--success-bg)', key: 'approved' as Section },
                  { label: 'Rejected',value: stats?.rejected || '—', icon: XCircle,      color: 'var(--danger)',  bg: 'var(--danger-bg)',  key: 'rejected' as Section },
                  { label: "Today",   value: stats?.today    || '—', icon: Calendar,     color: '#7c3aed',        bg: '#f5f3ff',           key: 'all' as Section },
                ].map((s, i) => (
                  <motion.button
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}
                    onClick={() => navigate(s.key)}
                    className="admin-stat-card"
                    style={{ border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.875rem' }}>
                      <p style={{ fontSize: '.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</p>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.icon size={18} color={s.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  </motion.button>
                ))}
              </div>

              {/* Chart + Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 }} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
                    <TrendingUp size={17} color="var(--blue-700)" />
                    <h3 style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>Registrations — Last 7 Days</h3>
                  </div>
                  {chartData.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem', height: 110 }}>
                      {chartData.map((d, i) => {
                        const max = Math.max(...chartData.map(x => x.count), 1);
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--blue-700)' }}>{d.count}</span>
                            <div style={{ width: '100%', height: `${Math.max((d.count / max) * 85, 6)}px`, background: 'linear-gradient(to top, var(--blue-800), var(--blue-500))', borderRadius: '4px 4px 0 0', transition: 'height .5s' }} />
                            <span style={{ fontSize: '.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 }} className="card" style={{ padding: '1.5rem', maxHeight: 280, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.125rem' }}>
                    <Activity size={17} color="var(--blue-700)" />
                    <h3 style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>Recent Activity</h3>
                  </div>
                  {logs.slice(0, 8).map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: '.75rem', marginBottom: '.75rem', paddingBottom: '.75rem', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action === 'approve' ? 'var(--success)' : log.action === 'reject' ? 'var(--danger)' : 'var(--blue-500)', flexShrink: 0, marginTop: 6 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '.84rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          {log.admin_name} · {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '.875rem' }}>No activity yet</p>}
                </motion.div>
              </div>

              {/* Pending alert */}
              {Number(stats?.pending) > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}
                  style={{ marginTop: '1.25rem', background: 'var(--warning-bg)', border: '1px solid var(--warning-bdr)', borderRadius: 12, padding: '1.125rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#92400e', fontSize: '.9rem' }}>Action Required</p>
                    <p style={{ color: '#a16207', fontSize: '.85rem' }}>{stats?.pending} registration(s) are awaiting your review.</p>
                  </div>
                  <button onClick={() => navigate('pending')} className="btn btn-sm" style={{ background: 'var(--warning)', color: '#fff', flexShrink: 0 }}>
                    Review Now
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* REGISTRATIONS TABLE */}
          {section !== 'dashboard' && section !== 'logs' && (
            <div>
              {/* Search bar */}
              <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="admin-search"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="Search by name, phone, registration ID, district..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button id="search-btn" onClick={handleSearch} className="btn btn-primary btn-sm" style={{ display: 'flex', gap: 5 }}>
                  <Search size={14} /> Search
                </button>
                <div style={{ display: 'flex', gap: '.375rem' }}>
                  {(['all', 'pending', 'approved', 'rejected'] as Section[]).map(s => (
                    <button
                      key={s}
                      id={`filter-${s}`}
                      onClick={() => { setSection(s); setPage(1); }}
                      className={`btn btn-sm ${section === s ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <div className="spinner-dark" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Loading...</p>
                    </div>
                  ) : registrations.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <Users size={38} style={{ color: 'var(--text-muted)', opacity: .35, margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No registrations found</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginTop: 4 }}>Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('registration_id')}>
                            Reg ID {sortBy === 'registration_id' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                          </th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('full_name')}>
                            Name {sortBy === 'full_name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                          </th>
                          <th>Phone</th>
                          <th>District</th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('status')}>
                            Status {sortBy === 'status' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                          </th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('submitted_at')}>
                            Date {sortBy === 'submitted_at' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                          </th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(reg => (
                          <tr key={reg.id}>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.84rem', color: 'var(--blue-700)' }}>{reg.registration_id}</span>
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.full_name}</td>
                            <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '.88rem' }}>{reg.phone}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{reg.district}</td>
                            <td>
                              <span className={`badge ${STATUS_COLORS[reg.status].badge}`}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[reg.status].dot, display: 'inline-block' }} />
                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '.84rem', whiteSpace: 'nowrap' }}>
                              {new Date(reg.submitted_at).toLocaleDateString('en-IN')}
                            </td>
                            <td>
                              <button
                                id={`view-${reg.id}`}
                                onClick={() => { setSelectedReg(reg); setShowRejectInput(false); setRejectReason(''); }}
                                className="btn btn-ghost btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Eye size={14} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.875rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '.84rem', color: 'var(--text-muted)' }}>
                      {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} of {total}
                    </p>
                    <div style={{ display: 'flex', gap: '.375rem' }}>
                      <button id="prev-page" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <span style={{ padding: '.35rem .75rem', background: 'var(--surface-2)', borderRadius: 7, fontSize: '.84rem', fontWeight: 600 }}>{page} / {totalPages}</span>
                      <button id="next-page" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY LOGS */}
          {section === 'logs' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Action</th><th>Admin</th><th>Reg ID</th><th>Details</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td>
                        <span className={`badge ${log.action === 'approve' ? 'badge-approved' : log.action === 'reject' ? 'badge-rejected' : 'badge-pending'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.admin_name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--blue-700)', fontSize: '.84rem' }}>{log.registration_id || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '.84rem', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No activity logs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Registration Detail Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedReg && (
          <div className="modal-overlay" onClick={() => setSelectedReg(null)}>
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: .9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .9 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.175rem', color: 'var(--text-primary)' }}>Registration Details</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', fontFamily: 'monospace', marginTop: 2 }}>{selectedReg.registration_id}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <span className={`badge ${STATUS_COLORS[selectedReg.status].badge}`}>
                    {selectedReg.status.charAt(0).toUpperCase() + selectedReg.status.slice(1)}
                  </span>
                  <button onClick={() => setSelectedReg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div style={{ padding: '1.5rem 1.75rem', maxHeight: '54vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {(
                    [
                      ['Full Name', selectedReg.full_name],
                      ['Father / Mother / Husband', selectedReg.parent_spouse_name],
                      ['Phone', selectedReg.phone],
                      ['Email', selectedReg.email || 'Not provided'],
                      ['Area / Village', selectedReg.area_village],
                      ['PIN Code', selectedReg.pin_code],
                      ['Taluk', selectedReg.taluk],
                      ['District', selectedReg.district],
                      ['State', selectedReg.state || '—'],
                      ['Country', selectedReg.country || '—'],
                      ['Submitted At', new Date(selectedReg.submitted_at).toLocaleString('en-IN')],
                      ['Reviewed By', selectedReg.reviewed_by_name || '—'],
                      ...(selectedReg.reviewed_at ? [['Reviewed At', new Date(selectedReg.reviewed_at).toLocaleString('en-IN')]] : []),
                    ] as [string, string][]
                  ).map(pair => (
                    <div key={pair[0]} style={{ gridColumn: pair[0] === 'Submitted At' ? '1 / -1' : undefined }}>
                      <p style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{pair[0]}</p>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '.9375rem' }}>{pair[1]}</p>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Full Address</p>
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.65, fontWeight: 500 }}>{selectedReg.full_address}</p>
                  </div>
                </div>

                {selectedReg.rejection_reason && (
                  <div style={{ marginTop: '1.25rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-bdr)', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '.875rem', marginBottom: 4 }}>Rejection Reason</p>
                    <p style={{ color: '#991b1b', fontSize: '.875rem' }}>{selectedReg.rejection_reason}</p>
                  </div>
                )}

                <AnimatePresence>
                  {showRejectInput && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '1.25rem' }}>
                      <label className="form-label">Rejection Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <textarea
                        id="reject-reason"
                        className="form-input"
                        rows={3}
                        placeholder="State reason for rejection..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal actions */}
              <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {!showRejectInput ? (
                  <>
                    {selectedReg.status !== 'pending' && (
                      <button onClick={() => markPending(selectedReg.id)} className="btn btn-ghost" disabled={actionLoading}>
                        <Clock size={16} /> Mark as Pending
                      </button>
                    )}
                    {selectedReg.status !== 'rejected' && (
                      <button id="reject-btn" onClick={() => setShowRejectInput(true)} className="btn btn-danger" disabled={actionLoading}>
                        <XCircle size={16} /> Reject
                      </button>
                    )}
                    {selectedReg.status !== 'approved' && (
                      <button id="approve-btn" onClick={() => approve(selectedReg.id)} className="btn btn-success" disabled={actionLoading}>
                        {actionLoading ? <><div className="spinner" />Processing...</> : <><CheckCircle size={16} />Approve</>}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => { setShowRejectInput(false); setRejectReason(''); }} className="btn btn-ghost">Cancel</button>
                    <button id="confirm-reject-btn" onClick={() => reject(selectedReg.id)} className="btn btn-danger" disabled={actionLoading}>
                      {actionLoading ? <><div className="spinner" />Processing...</> : <><XCircle size={16} />Confirm Reject</>}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar fix */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          div[style*="margin-left: 256px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
