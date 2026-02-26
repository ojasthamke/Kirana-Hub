'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Box, ShoppingBag, TrendingUp, ShieldCheck,
    Plus, Edit2, Trash2, CheckCircle, XCircle, X,
    Eye, EyeOff, DollarSign, Package, AlertCircle, RefreshCw
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
interface Vendor { _id: string; name: string; store_name: string; gst_number: string; phone: string; email: string; store_address: string; turnover: string; status: 'approved' | 'blocked' | 'pending'; createdAt: string; }
interface Product { _id: string; name_en: string; name_hi: string; category: string; price: number; stock: number; status: string; vendor_id: { _id: string; store_name: string } | null; offer?: string; }
interface Order { _id: string; order_id: string; master_order_id: string; total_amount: number; status: string; payment_status: string; createdAt: string; vendor_id: { store_name: string } | null; user_id: { name: string; phone: string } | null; products: any[]; }

const CATEGORIES = ['Pulses', 'Rice', 'Staples', 'Spices', 'Oil', 'Flour', 'Sugar', 'Dry Fruits', 'Other'];
const ORDER_STATUSES = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

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
        approved: ['#dcfce7', '#15803d'], active: ['#dcfce7', '#15803d'], 'In Stock': ['#dcfce7', '#15803d'],
        blocked: ['#fee2e2', '#ef4444'], 'Out of Stock': ['#fee2e2', '#ef4444'], Cancelled: ['#fee2e2', '#ef4444'],
        pending: ['#fef9c3', '#92400e'], Pending: ['#fef9c3', '#92400e'],
        Delivered: ['#dcfce7', '#15803d'], Processing: ['#dbeafe', '#1d4ed8'], Accepted: ['#dbeafe', '#1d4ed8'], 'Out for Delivery': ['#ede9fe', '#6d28d9'],
    };
    const [bg, color] = map[status] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color, fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{status}</span>;
};

/* ─── Main Component ──────────────────────────────────────── */
export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'overview' | 'vendors' | 'products' | 'orders'>('overview');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [modal, setModal] = useState<'vendor' | 'product' | 'editVendor' | 'editProduct' | null>(null);
    const [selected, setSelected] = useState<any>(null);
    const [showPw, setShowPw] = useState(false);

    /* Vendor form */
    const emptyV = { name: '', store_name: '', store_address: '', gst_number: '', turnover: '', phone: '', email: '', password: '' };
    const [vForm, setVForm] = useState(emptyV);

    /* Product form */
    const emptyP = { name_en: '', name_hi: '', category: 'Pulses', price: '', stock: '', status: 'In Stock', vendor_id: '', offer: '' };
    const [pForm, setPForm] = useState(emptyP);

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const [vr, pr, or] = await Promise.all([
                fetch('/api/admin/vendors'),
                fetch('/api/admin/products'),
                fetch('/api/admin/orders')
            ]);
            // Check for 401 — session expired or not logged in
            if (vr.status === 401) {
                router.push('/login');
                return;
            }
            const [vd, pd, od] = await Promise.all([vr.json(), pr.json(), or.json()]);
            if (vd.error) { setLoadError(vd.error); setLoading(false); return; }
            if (Array.isArray(vd)) setVendors(vd);
            if (Array.isArray(pd)) setProducts(pd);
            if (Array.isArray(od)) setOrders(od);
        } catch (e: any) {
            setLoadError('Could not connect to database. Check your internet connection.');
        }
        setLoading(false);
    }, [router]);

    useEffect(() => { load(); }, [load]);

    /* ── Vendor actions ── */
    const addVendor = async () => {
        setSaving(true); setErr('');
        const r = await fetch('/api/admin/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vForm) });
        const d = await r.json();
        if (d.success) { setModal(null); setVForm(emptyV); load(); }
        else setErr(d.error || 'Failed');
        setSaving(false);
    };

    const updateVendor = async (vendorId: string, patch: any) => {
        await fetch('/api/admin/vendors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, ...patch }) });
        load();
    };

    const deleteVendor = async (vendorId: string) => {
        if (!confirm('Delete this vendor? This cannot be undone.')) return;
        await fetch('/api/admin/vendors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId }) });
        load();
    };

    /* ── Product actions ── */
    const addProduct = async () => {
        setSaving(true); setErr('');
        const payload = { ...pForm, price: Number(pForm.price), stock: Number(pForm.stock) };
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
        const payload = { productId: selected._id, ...pForm, price: Number(pForm.price), stock: Number(pForm.stock) };
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

    const openEditProduct = (p: Product) => {
        setSelected(p);
        setPForm({ name_en: p.name_en, name_hi: p.name_hi, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status, vendor_id: p.vendor_id?._id || '', offer: p.offer || '' });
        setModal('editProduct');
    };

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--gray-200)', borderTopColor: 'var(--gray-900)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading admin data...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (loadError) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" strokeWidth={1.5} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Failed to Load Data</h2>
            <p style={{ color: '#64748b', maxWidth: 400 }}>{loadError}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={load} style={{ padding: '0.625rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
                <button onClick={() => router.push('/login')} style={{ padding: '0.625rem 1.5rem', background: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Re-login</button>
            </div>
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
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Full control of vendors, products, orders and marketplace.</p>
                    </div>
                    <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer' }}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 12, padding: '0.25rem', gap: '0.2rem', marginBottom: '2rem', overflowX: 'auto', width: 'fit-content', maxWidth: '100%' }}>
                    {[
                        { id: 'overview', icon: <TrendingUp size={16} />, label: 'Overview' },
                        { id: 'vendors', icon: <Users size={16} />, label: `Vendors (${vendors.length})` },
                        { id: 'products', icon: <Package size={16} />, label: `Products (${products.length})` },
                        { id: 'orders', icon: <ShoppingBag size={16} />, label: `Orders (${orders.length})` },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? 'var(--gray-900)' : 'var(--gray-500)', boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none' }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW ── */}
                {tab === 'overview' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <Stat icon={<Users size={22} />} label="Total Vendors" value={vendors.length} color="var(--blue)" />
                            <Stat icon={<Package size={22} />} label="Products Listed" value={products.length} color="var(--accent)" />
                            <Stat icon={<ShoppingBag size={22} />} label="Total Orders" value={orders.length} color="#8b5cf6" />
                            <Stat icon={<DollarSign size={22} />} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="var(--accent)" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            {/* Pending vendors */}
                            <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 16, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: '1rem' }}>Recent Vendors</h3>
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
                            <h2 style={{ fontSize: '1.125rem' }}>All Vendors</h2>
                            <button onClick={() => { setErr(''); setVForm(emptyV); setModal('vendor'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Plus size={16} /> Add Vendor
                            </button>
                        </div>

                        {vendors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <Users size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>No vendors yet. Add your first vendor.</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Store Name', 'Owner', 'Phone', 'GST', 'Status', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.map(v => (
                                                <tr key={v._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{v.store_name}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{v.name}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)' }}>{v.phone}</td>
                                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{v.gst_number}</td>
                                                    <td style={{ padding: '1rem' }}><Badge status={v.status} /></td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
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

                {/* ── PRODUCTS ── */}
                {tab === 'products' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>All Products</h2>
                            <button onClick={() => { setErr(''); setPForm(emptyP); setModal('product'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <Package size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>No products yet. Add your first product.</p>
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
                                            {products.map(p => (
                                                <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{p.name_en}</td>
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
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed var(--gray-200)', borderRadius: 16, color: 'var(--gray-400)' }}>
                                <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>No orders yet.</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 800 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--gray-50)' }}>
                                                {['Order ID', 'Customer', 'Vendor', 'Amount', 'Status', 'Payment', 'Date'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(o => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.order_id?.slice(-8) || o._id.slice(-8)}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.user_id?.name || '—'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{o.user_id?.phone || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-600)', fontSize: '0.8125rem' }}>{o.vendor_id?.store_name || '—'}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 700 }}>₹{o.total_amount}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={o.status} onChange={e => updateOrder(o._id, { status: e.target.value })}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none' }}>
                                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}><Badge status={o.payment_status || 'Pending'} /></td>
                                                    <td style={{ padding: '1rem', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
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

            {/* ── MODAL: Add Vendor ── */}
            {modal === 'vendor' && (
                <Modal title="Add New Vendor" onClose={() => setModal(null)}>
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
                            {saving ? 'Creating...' : 'Create Vendor Account'}
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
                            <FI label="Category"><Select value={pForm.category} onChange={(e: any) => setPForm(p => ({ ...p, category: e.target.value }))} options={CATEGORIES} /></FI>
                            <FI label="Assign Vendor">
                                <Select value={pForm.vendor_id} onChange={(e: any) => setPForm(p => ({ ...p, vendor_id: e.target.value }))}
                                    options={[{ value: '', label: '— No vendor —' }, ...vendors.map(v => ({ value: v._id, label: v.store_name }))]} />
                            </FI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FI label="Price (₹)"><Input type="number" placeholder="0" min="0" value={pForm.price} onChange={(e: any) => setPForm(p => ({ ...p, price: e.target.value }))} /></FI>
                            <FI label="Stock Quantity"><Input type="number" placeholder="0" min="0" value={pForm.stock} onChange={(e: any) => setPForm(p => ({ ...p, stock: e.target.value }))} /></FI>
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

            <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } } tr:hover td { background: var(--gray-50) !important; } @media (max-width:600px){ th, td { padding: 0.625rem 0.75rem !important; } }`}</style>
        </div>
    );
}
