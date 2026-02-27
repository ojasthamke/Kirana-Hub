'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Box, ShoppingBag, TrendingUp, ShieldCheck,
    Plus, Edit2, Trash2, CheckCircle, XCircle, X,
    Eye, EyeOff, DollarSign, Package, AlertCircle, RefreshCw, Search, Banknote, CreditCard
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
interface User { _id: string; name: string; phone: string; address: string; business_type: string; createdAt: string; }
interface Agency { _id: string; name: string; store_name: string; gst_number: string; phone: string; email: string; store_address: string; turnover: string; status: 'approved' | 'blocked' | 'pending'; createdAt: string; }
interface Product { _id: string; name_en: string; name_hi: string; category: string; price: number; stock: number; unit: string; min_qty: number; status: string; vendor_id: { _id: string; store_name: string } | null; offer?: string; }
interface Order { _id: string; order_id: string; master_order_id: string; total_amount: number; status: string; payment_status: string; payment_method?: string; createdAt: string; vendor_id: { store_name: string } | null; user_id: { name: string; phone: string; address?: string } | null; products: any[]; }

const CATEGORIES = ['Pulses', 'Rice', 'Staples', 'Spices', 'Oil', 'Flour', 'Sugar', 'Dry Fruits', 'Other'];
const ORDER_STATUSES = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Pending Approval'];
const UNITS = ['kg', 'g', 'pcs', 'pack', 'liter', 'ml'];

/* ─── Mini Components ────────────────────────────────────── */
const Stat = ({ icon, label, value, color }: any) => (
    <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--gray-900)' }}>{value}</div>
        </div>
    </div>
);

const Modal = ({ title, onClose, children }: any) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--gray-200)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>
        </div>
    </div>
);

const FI = ({ label, children }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)' }}>{label}</label>
        {children}
    </div>
);

const Input = (props: any) => (
    <input {...props} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.9375rem', width: '100%', outline: 'none', color: 'var(--gray-900)', ...props.style }}
        onFocus={e => e.target.style.borderColor = 'var(--gray-400)'}
        onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
);

const Select = ({ options, ...props }: any) => (
    <select {...props} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.9375rem', width: '100%', outline: 'none', color: 'var(--gray-900)', background: '#fff', ...props.style }}>
        {options.map((o: any) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
);

const Badge = ({ status }: { status: string }) => {
    const map: Record<string, [string, string]> = {
        approved: ['#dcfce7', '#15803d'], active: ['#dcfce7', '#15803d'], 'In Stock': ['#dcfce7', '#15803d'], Paid: ['#dcfce7', '#15803d'],
        blocked: ['#fee2e2', '#ef4444'], 'Out of Stock': ['#fee2e2', '#ef4444'], Cancelled: ['#fee2e2', '#ef4444'], Unpaid: ['#fee2e2', '#ef4444'],
        pending: ['#fef9c3', '#92400e'], Pending: ['#fef9c3', '#92400e'], 'Pending Approval': ['#fef9c3', '#92400e'],
        Delivered: ['#dcfce7', '#15803d'], Processing: ['#dbeafe', '#1d4ed8'], Accepted: ['#dbeafe', '#1d4ed8'], 'Out for Delivery': ['#ede9fe', '#6d28d9'],
    };
    const [bg, color] = map[status] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{status}</span>;
};

/* ─── Main Component ──────────────────────────────────────── */
export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'overview' | 'vendors' | 'products' | 'orders' | 'users'>('overview');
    const [vendors, setVendors] = useState<Agency[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [modal, setModal] = useState<'vendor' | 'product' | 'editVendor' | 'editProduct' | 'editUser' | 'orderDetails' | null>(null);
    const [selected, setSelected] = useState<any>(null);
    const [showPw, setShowPw] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    /* Vendor form */
    const emptyV = { name: '', store_name: '', store_address: '', gst_number: '', turnover: '', phone: '', email: '', password: '' };
    const [vForm, setVForm] = useState(emptyV);

    /* Product form */
    const emptyP = { name_en: '', name_hi: '', category: 'Pulses', price: '', stock: '', unit: 'kg', min_qty: '1', status: 'In Stock', vendor_id: '', offer: '' };
    const [pForm, setPForm] = useState(emptyP);

    /* User form */
    const emptyU = { name: '', phone: '', address: '', password: '', business_type: 'Kirana Store' };
    const [uForm, setUForm] = useState(emptyU);

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const [customCat, setCustomCat] = useState('');
    const [catList, setCatList] = useState(CATEGORIES);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const [vr, pr, or, ur] = await Promise.all([
                fetch('/api/admin/agencies'),
                fetch('/api/admin/products'),
                fetch('/api/admin/orders'),
                fetch('/api/admin/users')
            ]);
            // Check for 401 — session expired or not logged in
            if (vr.status === 401) {
                router.push('/login');
                return;
            }
            const [vd, pd, od, ud] = await Promise.all([
                vr.ok ? vr.json() : Promise.resolve([]),
                pr.ok ? pr.json() : Promise.resolve([]),
                or.ok ? or.json() : Promise.resolve([]),
                ur.ok ? ur.json() : Promise.resolve([])
            ]);

            if (Array.isArray(vd)) setVendors(vd);
            if (Array.isArray(pd)) setProducts(pd);
            if (Array.isArray(od)) setOrders(od);
            if (Array.isArray(ud)) setUsers(ud);

            if (!vr.ok && vr.status === 401) { router.push('/login'); return; }
            if (!vr.ok || !pr.ok || !or.ok) setLoadError('Some data failed to load. Please try again.');
        } catch (e: any) {
            setLoadError('Could not connect to database. Check your internet connection.');
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        load();
    }, [load]);

    /* ── Vendor actions ── */
    const addVendor = async () => {
        setSaving(true); setErr('');
        const r = await fetch('/api/admin/agencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vForm) });
        const d = await r.json();
        if (d.success) { setModal(null); setVForm(emptyV); load(); }
        else setErr(d.error || 'Failed');
        setSaving(false);
    };

    const updateVendor = async (vendorId: string, patch: any) => {
        await fetch('/api/admin/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, ...patch }) });
        load();
    };

    const deleteVendor = async (vendorId: string) => {
        if (!confirm('Delete this agency? This cannot be undone.')) return;
        await fetch('/api/admin/agencies', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId }) });
        load();
    };

    const openEditVendor = (v: any) => {
        setSelected(v);
        setVForm({ name: v.name, store_name: v.store_name, store_address: v.store_address, gst_number: v.gst_number, turnover: v.turnover, phone: v.phone, email: v.email, password: '' });
        setModal('editVendor');
    };

    const saveVendor = async () => {
        setSaving(true); setErr('');
        const res = await fetch('/api/admin/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId: selected._id, ...vForm }) });
        const data = await res.json();
        if (data.success) { setModal(null); load(); } else setErr(data.error || 'Failed to update');
        setSaving(false);
    };

    /* ── User actions ── */
    const openEditUser = (u: any) => {
        setSelected(u);
        setUForm({ name: u.name, phone: u.phone, address: u.address, business_type: u.business_type, password: '' });
        setModal('editUser');
    };

    const saveUser = async () => {
        setSaving(true); setErr('');
        const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selected._id, ...uForm }) });
        const data = await res.json();
        if (data.success) { setModal(null); load(); } else setErr(data.error || 'Failed to update');
        setSaving(false);
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Delete this user?')) return;
        await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
        load();
    };

    /* ── Product actions ── */
    const addProduct = async () => {
        setSaving(true); setErr('');
        const payload = { ...pForm, price: Number(pForm.price), stock: Number(pForm.stock), min_qty: Number(pForm.min_qty) };
        if (!pForm.offer) delete (payload as any).offer;
        if (!pForm.vendor_id) delete (payload as any).vendor_id;
        const r = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const d = await r.json();
        if (d.success) { setModal(null); setPForm(emptyP); load(); }
        else setErr(d.error || 'Failed');
        setSaving(false);
    };

    const saveProduct = async () => {
        setSaving(true); setErr('');
        const payload = { productId: selected._id, ...pForm, price: Number(pForm.price), stock: Number(pForm.stock), min_qty: Number(pForm.min_qty) };
        const r = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const d = await r.json();
        if (d.success) { setModal(null); load(); }
        else setErr(d.error || 'Failed');
        setSaving(false);
    };

    const deleteProduct = async (productId: string) => {
        if (!confirm('Delete this product?')) return;
        await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
        load();
    };

    const updateOrder = async (orderId: string, patch: any) => {
        await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, ...patch }) });
        load();
    };

    const openEditProduct = (p: any) => {
        setSelected(p);
        setPForm({ name_en: p.name_en, name_hi: p.name_hi, category: p.category, price: String(p.price), stock: String(p.stock), unit: p.unit || 'kg', min_qty: String(p.min_qty || 1), status: p.status, vendor_id: p.vendor_id?._id || '', offer: p.offer || '' });
        setModal('editProduct');
    };

    if (loadError) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: '#fff', padding: '2.5rem', borderRadius: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)', maxWidth: 400 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <AlertCircle size={24} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Connection Error</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>{loadError}</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => window.location.reload()} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1.5px solid var(--gray-200)', background: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Reload Page</button>
                    <button onClick={load} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'var(--gray-900)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Retry Now</button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--gray-100)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginTop: '1rem', fontWeight: 500 }}>Fetching dashboard data...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((a, o) => a + o.total_amount, 0);

    /* ─────── RENDER ─────── */
    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.25rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <ShieldCheck size={20} color="var(--accent)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>Super Admin</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginBottom: '0.2rem' }}>KiranaHub Admin</h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Full control of agencies, products, orders and marketplace.</p>
                    </div>
                    <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer' }}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 12, padding: '0.25rem', gap: '0.2rem', overflowX: 'auto', width: 'fit-content' }}>
                        {[
                            { id: 'overview', icon: <TrendingUp size={16} />, label: 'Overview' },
                            { id: 'vendors', icon: <Users size={16} />, label: `Agencies (${vendors.length})` },
                            { id: 'users', icon: <Users size={16} />, label: `Users (${users.length})` },
                            { id: 'products', icon: <Package size={16} />, label: `Products (${products.length})` },
                            { id: 'orders', icon: <ShoppingBag size={16} />, label: `Orders (${orders.length})` },
                        ].map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id as any); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? 'var(--gray-900)' : 'var(--gray-500)', boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none' }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {tab !== 'overview' && (
                        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                placeholder={`Search ${tab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    borderRadius: 12, border: '1.5px solid var(--gray-200)',
                                    fontSize: '0.875rem', outline: 'none', background: '#fff'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* ── OVERVIEW ── */}
                {tab === 'overview' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <Stat icon={<Users size={22} />} label="Total Agencies" value={vendors.length} color="var(--blue)" />
                            <Stat icon={<Package size={22} />} label="Products Listed" value={products.length} color="var(--accent)" />
                            <Stat icon={<ShoppingBag size={22} />} label="Total Orders" value={orders.length} color="#8b5cf6" />
                            <Stat icon={<DollarSign size={22} />} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="var(--accent)" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            {/* Pending vendors */}
                            <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 16, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: '1rem' }}>Recent Agencies</h3>
                                    <button onClick={() => setTab('vendors')} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                                </div>
                                {vendors.slice(0, 5).map(v => (
                                    <div key={v._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.store_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{v.phone}</div>
                                        </div>
                                        <Badge status={v.status} />
                                    </div>
                                ))}
                            </div>

                            {/* Recent orders */}
                            <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 16, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: '1rem' }}>Recent Orders</h3>
                                    <button onClick={() => setTab('orders')} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                                </div>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.order_id}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>₹{o.total_amount}</div>
                                        </div>
                                        <Badge status={o.status} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VENDORS ── */}
                {tab === 'vendors' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>All Agencies</h2>
                            <button onClick={() => { setErr(''); setVForm(emptyV); setModal('vendor'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Plus size={16} /> Add Agency
                            </button>
                        </div>

                        {vendors.filter(v => v.store_name.toLowerCase().includes(searchQuery.toLowerCase()) || v.phone.includes(searchQuery)).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <Users size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>{searchQuery ? 'No vendors match your search.' : 'No vendors yet. Add your first vendor.'}</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Agency Name', 'Owner', 'Phone', 'GST', 'Status', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.filter(v => v.store_name.toLowerCase().includes(searchQuery.toLowerCase()) || v.phone.includes(searchQuery)).map(v => (
                                                <tr key={v._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{v.store_name}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{v.name}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{v.phone}</td>
                                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{v.gst_number}</td>
                                                    <td style={{ padding: '1rem' }}><Badge status={v.status} /></td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                                                            <button onClick={() => openEditVendor(v)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-600)', cursor: 'pointer' }}>
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => updateVendor(v._id, { status: v.status === 'approved' ? 'blocked' : 'approved' })}
                                                                style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: `1.5px solid ${v.status === 'approved' ? '#fee2e2' : '#dcfce7'}`, background: v.status === 'approved' ? '#fff5f5' : '#f0fdf4', color: v.status === 'approved' ? '#ef4444' : '#15803d', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                                {v.status === 'approved' ? 'Block' : 'Approve'}
                                                            </button>
                                                            <button onClick={() => deleteVendor(v._id)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── USERS ── */}
                {tab === 'users' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>All Registered Users</h2>
                        </div>
                        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery)).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <Users size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>No users found matching your search.</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Name', 'Phone/ID', 'Business Type', 'Address', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery)).map(u => (
                                                <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{u.name}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{u.phone}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{u.business_type}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>{u.address}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => openEditUser(u)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-600)', cursor: 'pointer' }}>
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => deleteUser(u._id)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PRODUCTS ── */}
                {tab === 'products' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>All Products</h2>
                            <button onClick={() => { setErr(''); setPForm(emptyP); setModal('product'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        {products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <Package size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>{searchQuery ? 'No products match your search.' : 'No products yet. Add your first product.'}</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Product', 'Hindi', 'Category', 'Price', 'Stock', 'Vendor', 'Status', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                                <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{p.name_en}</div>
                                                        {p.stock < 10 && <span style={{ fontSize: '0.6rem', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: 4, fontWeight: 800, marginTop: 4, display: 'inline-block' }}>LOW STOCK</span>}
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-500)' }}>{p.name_hi}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{p.category}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 700 }}>₹{p.price}</td>
                                                    <td style={{ padding: '1rem', color: p.stock < 10 ? '#ef4444' : 'var(--gray-600)', fontWeight: p.stock < 10 ? 700 : 400 }}>{p.stock}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{p.vendor_id?.store_name || '—'}</td>
                                                    <td style={{ padding: '1rem' }}><Badge status={p.status} /></td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => openEditProduct(p)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-700)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={14} /></button>
                                                            <button onClick={() => deleteProduct(p._id)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORDERS ── */}
                {tab === 'orders' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>All Orders</h2>
                        {orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || o.user_id?.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>{searchQuery ? 'No orders match your search.' : 'No orders yet.'}</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 800 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Order ID', 'Customer', 'Agency', 'Items', 'Amount', 'Pay Method', 'Status', 'Payment', 'Date', 'View'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || o.user_id?.name.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.order_id?.slice(-8) || o._id.slice(-8)}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.user_id?.name || '—'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{o.user_id?.phone || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)', fontSize: '0.8125rem' }}>{o.vendor_id?.store_name || '—'}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{o.products?.length || 0} SKU</td>
                                                    <td style={{ padding: '1rem', fontWeight: 700 }}>₹{o.total_amount}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {(o as any).payment_method === 'Online'
                                                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem' }}><CreditCard size={13} /> Online</span>
                                                            : <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 700, fontSize: '0.8rem' }}><Banknote size={13} /> Cash</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={o.status} onChange={e => updateOrder(o._id, { status: e.target.value })}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none' }}>
                                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={o.payment_status} onChange={e => updateOrder(o._id, { payment_status: e.target.value })}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none', color: o.payment_status === 'Paid' ? '#16a34a' : '#dc2626' }}>
                                                            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button onClick={() => { setSelected(o); setModal('orderDetails'); }} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-600)', cursor: 'pointer' }}>
                                                            <Eye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── MODAL: Add Agency ── */}
            {modal === 'vendor' && (
                <Modal title="Add New Agency" onClose={() => setModal(null)}>
                    {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem' }}>{err}</div>}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Owner Name"><Input placeholder="Full name" value={vForm.name} onChange={(e: any) => setVForm(p => ({ ...p, name: e.target.value }))} /></FI>
                            <FI label="Store Name"><Input placeholder="Store / Shop name" value={vForm.store_name} onChange={(e: any) => setVForm(p => ({ ...p, store_name: e.target.value }))} /></FI>
                        </div>
                        <FI label="Store Address"><Input placeholder="Full address" value={vForm.store_address} onChange={(e: any) => setVForm(p => ({ ...p, store_address: e.target.value }))} /></FI>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="GST Number"><Input placeholder="22AAAAA0000A1Z5" value={vForm.gst_number} onChange={(e: any) => setVForm(p => ({ ...p, gst_number: e.target.value }))} /></FI>
                            <FI label="Approx Turnover">
                                <Select value={vForm.turnover} onChange={(e: any) => setVForm(p => ({ ...p, turnover: e.target.value }))}
                                    options={[{ value: '', label: 'Select...' }, 'Under 10L', '10L – 50L', '50L – 1Cr', '1Cr+']} />
                            </FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Phone"><Input placeholder="+91 00000 00000" value={vForm.phone} onChange={(e: any) => setVForm(p => ({ ...p, phone: e.target.value }))} /></FI>
                            <FI label="Email"><Input type="email" placeholder="email@store.com" value={vForm.email} onChange={(e: any) => setVForm(p => ({ ...p, email: e.target.value }))} /></FI>
                        </div>
                        <FI label="Login Password">
                            <div style={{ position: 'relative' }}>
                                <Input type={showPw ? 'text' : 'password'} placeholder="Vendor login password" value={vForm.password} onChange={(e: any) => setVForm(p => ({ ...p, password: e.target.value }))} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </FI>
                        <button onClick={addVendor} disabled={saving} style={{ padding: '0.75rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                            {saving ? 'Creating...' : 'Create Agency Account'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── MODAL: Add Product ── */}
            {(modal === 'product' || modal === 'editProduct') && (
                <Modal title={modal === 'product' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)}>
                    {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem' }}>{err}</div>}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Product Name (English)"><Input placeholder="e.g. Toor Dal" value={pForm.name_en} onChange={(e: any) => setPForm(p => ({ ...p, name_en: e.target.value }))} /></FI>
                            <FI label="Product Name (Hindi)"><Input placeholder="e.g. तूर दाल" value={pForm.name_hi} onChange={(e: any) => setPForm(p => ({ ...p, name_hi: e.target.value }))} /></FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Category">
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <Select value={pForm.category} onChange={(e: any) => setPForm(p => ({ ...p, category: e.target.value }))} options={catList} />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input value={customCat} onChange={(e: any) => setCustomCat(e.target.value)}
                                            placeholder="Or type a custom category..."
                                            onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); if (customCat.trim() && !catList.includes(customCat.trim())) { const updated = [...catList, customCat.trim()]; setCatList(updated); } setPForm((p: any) => ({ ...p, category: customCat.trim() })); setCustomCat(''); } }}
                                            style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.85rem', outline: 'none' }} />
                                        <button type="button" onClick={() => { if (customCat.trim() && !catList.includes(customCat.trim())) { const updated = [...catList, customCat.trim()]; setCatList(updated); } if (customCat.trim()) { setPForm((p: any) => ({ ...p, category: customCat.trim() })); setCustomCat(''); } }} style={{ padding: '0.4rem 0.875rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
                                    </div>
                                </div>
                            </FI>
                            <FI label="Assign Agency">
                                <Select value={pForm.vendor_id} onChange={(e: any) => setPForm(p => ({ ...p, vendor_id: e.target.value }))}
                                    options={[{ value: '', label: '— No agency —' }, ...vendors.map(v => ({ value: v._id, label: v.store_name }))]} />
                            </FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Price (₹)"><Input type="number" placeholder="0" min="0" value={pForm.price} onChange={(e: any) => setPForm(p => ({ ...p, price: e.target.value }))} /></FI>
                            <FI label="Stock Quantity"><Input type="number" placeholder="0" min="0" value={pForm.stock} onChange={(e: any) => setPForm(p => ({ ...p, stock: e.target.value }))} /></FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Unit"><Select value={pForm.unit} onChange={(e: any) => setPForm(p => ({ ...p, unit: e.target.value }))} options={UNITS} /></FI>
                            <FI label="Min Qty"><Input type="number" min="1" value={pForm.min_qty} onChange={(e: any) => setPForm(p => ({ ...p, min_qty: e.target.value }))} /></FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Status"><Select value={pForm.status} onChange={(e: any) => setPForm(p => ({ ...p, status: e.target.value }))} options={['In Stock', 'Out of Stock']} /></FI>
                            <FI label="Offer Badge (optional)"><Input placeholder="e.g. Best Deal" value={pForm.offer} onChange={(e: any) => setPForm(p => ({ ...p, offer: e.target.value }))} /></FI>
                        </div>
                        <button onClick={modal === 'product' ? addProduct : saveProduct} disabled={saving} style={{ padding: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                            {saving ? 'Saving...' : modal === 'product' ? 'Add Product' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── MODAL: Edit Agency ── */}
            {modal === 'editVendor' && (
                <Modal title="Edit Agency Details" onClose={() => setModal(null)}>
                    {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem' }}>{err}</div>}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Owner Name"><Input placeholder="Full name" value={vForm.name} onChange={(e: any) => setVForm(p => ({ ...p, name: e.target.value }))} /></FI>
                            <FI label="Store Name"><Input placeholder="Store / Shop name" value={vForm.store_name} onChange={(e: any) => setVForm(p => ({ ...p, store_name: e.target.value }))} /></FI>
                        </div>
                        <FI label="Store Address"><Input placeholder="Full address" value={vForm.store_address} onChange={(e: any) => setVForm(p => ({ ...p, store_address: e.target.value }))} /></FI>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Phone"><Input placeholder="+91 00000 00000" value={vForm.phone} onChange={(e: any) => setVForm(p => ({ ...p, phone: e.target.value }))} /></FI>
                            <FI label="Email"><Input type="email" placeholder="email@store.com" value={vForm.email} onChange={(e: any) => setVForm(p => ({ ...p, email: e.target.value }))} /></FI>
                        </div>
                        <FI label="New Password (Leave blank to keep same)">
                            <div style={{ position: 'relative' }}>
                                <Input type={showPw ? 'text' : 'password'} placeholder="New login password" value={vForm.password} onChange={(e: any) => setVForm(p => ({ ...p, password: e.target.value }))} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </FI>
                        <button onClick={saveVendor} disabled={saving} style={{ padding: '0.75rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                            {saving ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── MODAL: Edit User ── */}
            {modal === 'editUser' && (
                <Modal title="Edit User Details" onClose={() => setModal(null)}>
                    {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem' }}>{err}</div>}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <FI label="Full Name"><Input placeholder="Full name" value={uForm.name} onChange={(e: any) => setUForm(p => ({ ...p, name: e.target.value }))} /></FI>
                        <FI label="Phone / ID"><Input placeholder="Phone number" value={uForm.phone} onChange={(e: any) => setUForm(p => ({ ...p, phone: e.target.value }))} /></FI>
                        <FI label="Store Address"><Input placeholder="Full address" value={uForm.address} onChange={(e: any) => setUForm(p => ({ ...p, address: e.target.value }))} /></FI>
                        <FI label="New Password (Leave blank to keep same)">
                            <div style={{ position: 'relative' }}>
                                <Input type={showPw ? 'text' : 'password'} placeholder="New login password" value={uForm.password} onChange={(e: any) => setUForm(p => ({ ...p, password: e.target.value }))} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </FI>
                        <button onClick={saveUser} disabled={saving} style={{ padding: '0.75rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                            {saving ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── MODAL: Order Details ── */}
            {modal === 'orderDetails' && selected && (
                <Modal title={`Order Details: ${selected.order_id?.slice(-8) || selected._id.slice(-8)}`} onClose={() => setModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Summary Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Placed On</div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <Badge status={selected.status} />
                                <div style={{ marginTop: '0.25rem' }}><Badge status={selected.payment_status} /></div>
                            </div>
                        </div>

                        {/* Customer & Agency Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 12 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Details</div>
                                <div style={{ fontWeight: 700 }}>{selected.user_id?.name || 'Unknown User'}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{selected.user_id?.phone}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{selected.user_id?.address}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 12 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Agency Details</div>
                                <div style={{ fontWeight: 700 }}>{selected.vendor_id?.store_name || 'Direct Order'}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Payment: {selected.payment_method || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Ordered Items</div>
                            <div style={{ border: '1.5px solid var(--gray-100)', borderRadius: 12, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.products?.map((p: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: i === selected.products.length - 1 ? 'none' : '1px solid var(--gray-50)' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{p.quantity}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{p.price}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>₹{p.price * p.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: 'var(--gray-900)', color: '#fff' }}>
                                            <td colSpan={3} style={{ padding: '0.875rem', fontWeight: 700 }}>Total Order Amount</td>
                                            <td style={{ padding: '0.875rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>₹{selected.total_amount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } } tr:hover td { background: var(--gray-50) !important; } @media (max-width:600px){ th, td { padding: 0.625rem 0.75rem !important; } }`}</style>
        </div>
    );
}
