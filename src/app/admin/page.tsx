'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, ShoppingBag, Users, Package, TrendingUp, MoreVertical, Layout, Store, CheckCircle, CreditCard, Banknote, Eye } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface User { _id: string; name: string; phone: string; address: string; role: 'user' | 'admin' | 'vendor'; }
interface Vendor { _id: string; name: string; store_name: string; phone: string; address: string; }
interface Order { _id: string; order_id: string; total_amount: number; status: string; payment_status: string; payment_method: string; createdAt: string; products: any[]; user_id?: User | null; vendor_id?: Vendor | null; }
interface Product { _id: string; name_en: string; name_hi: string; image_url?: string; category: string; price: number; stock: number; unit: string; min_qty: number; status: string; vendor_id?: Vendor | null; }

const ORDER_STATUSES = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Pending Approval'];

const Badge = ({ status }: { status: string }) => {
    const map: Record<string, string[]> = {
        'In Stock': ['#dcfce7', '#15803d'], Delivered: ['#dcfce7', '#15803d'], Paid: ['#dcfce7', '#15803d'],
        'Out of Stock': ['#fee2e2', '#dc2626'], Cancelled: ['#fee2e2', '#dc2626'], Unpaid: ['#fee2e2', '#dc2626'],
        Pending: ['#fef9c3', '#92400e'], Processing: ['#dbeafe', '#1d4ed8'],
        Accepted: ['#dbeafe', '#1d4ed8'], 'Out for Delivery': ['#ede9fe', '#6d28d9'],
        'Pending Approval': ['#fef9c3', '#92400e'],
    };
    const [bg, color] = map[status] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{status}</span>;
};

const Modal = ({ title, onClose, children }: any) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
                <button onClick={onClose} style={{ width: 32, height: 32, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>
        </div>
    </div>
);

const SI = (p: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{p.label}</label>
        {p.children}
    </div>
);

const Inp = (p: any) => <input {...p} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9375rem', width: '100%', outline: 'none', boxSizing: 'border-box', ...p.style }} />;

export default function AdminPage() {
    const [tab, setTab] = useState<'overview' | 'users' | 'agencies' | 'orders' | 'products'>('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [agencies, setAgencies] = useState<Vendor[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'user' | 'vendor' | 'order' | 'product' | 'orderDetails' | null>(null);
    const [selected, setSelected] = useState<any>(null);
    const [userHistory, setUserHistory] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadError, setLoadError] = useState(false);

    const load = async () => {
        setLoading(true); setLoadError(false);
        try {
            const [ur, ar, or, pr] = await Promise.all([
                apiFetch('/api/admin/users'),
                apiFetch('/api/admin/agencies'),
                apiFetch('/api/admin/orders'),
                apiFetch('/api/admin/products')
            ]);
            if (ur.status === 401) { window.location.href = '/login'; return; }
            setUsers(await ur.json());
            setAgencies(await ar.json());
            setOrders(await or.json());
            setProducts(await pr.json());
        } catch { setLoadError(true); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    // Fetch history
    useEffect(() => {
        if (selected?.user_id?._id && modal === 'orderDetails') {
            const history = orders.filter(o => o.user_id?._id === selected.user_id?._id && o._id !== selected._id);
            setUserHistory(history);
        }
    }, [selected, modal, orders]);

    const updateOrder = async (orderId: string, updates: any) => {
        await apiFetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
        load();
    };

    const deleteItem = async (type: string, id: string) => {
        if (!confirm('Are you sure?')) return;
        await apiFetch(`/api/admin/${type}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [`${type.slice(0, -1)}Id`]: id }) });
        load();
    };

    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                width: 64, height: 64, background: '#f0fdf4', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px -5px rgba(22, 163, 74, 0.1)', animation: 'pulse 1.5s infinite ease-in-out'
            }}>
                <Package size={32} color="#16a34a" style={{ animation: 'bounce 0.8s infinite alternate' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Admin Portal</p>
                <div style={{ height: 4, width: 120, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', margin: '0 auto' }}>
                    <div style={{ height: '100%', width: '40%', background: '#16a34a', borderRadius: 99, animation: 'loadProgress 1.5s infinite ease-in-out' }} />
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes bounce { from { transform: translateY(2px); } to { transform: translateY(-4px); } }
                @keyframes loadProgress { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
            `}</style>
        </div>
    );

    if (loadError) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Connection Error</h2>
                <p>Some data failed to load. Please try again.</p>
                <button onClick={load} style={{ padding: '0.75rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, marginTop: '1.5rem', cursor: 'pointer' }}>Retry Now</button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: 280, background: '#0f172a', color: '#fff', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
                    <img src="/logo.png" alt="KiranaHub" style={{ width: 'auto', height: 48, borderRadius: 8, background: '#fff' }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'overview', icon: <Layout size={18} />, label: 'Overview' },
                        { id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
                        { id: 'products', icon: <Package size={18} />, label: 'Marketplace' },
                        { id: 'users', icon: <Users size={18} />, label: 'Shop Owners' },
                        { id: 'agencies', icon: <Store size={18} />, label: 'Agencies' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setTab(item.id as any)} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem',
                            borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: tab === item.id ? '#16a34a' : 'transparent',
                            color: tab === item.id ? '#fff' : '#94a3b8',
                            fontWeight: tab === item.id ? 700 : 500,
                            textAlign: 'left'
                        }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Session</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ojas Thamke</div>
                    <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', padding: 0, marginTop: '0.5rem', cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '2.5rem', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h1>
                    <div style={{ position: 'relative', width: 320 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" placeholder={`Search ${tab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', outline: 'none' }} />
                    </div>
                </div>

                {/* ── OVERVIEW ── */}
                {tab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeUp 0.35s ease both' }}>
                        
                        {/* Primary Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { label: 'Total Marketplace Revenue', value: `₹${orders.reduce((acc, o) => acc + o.total_amount, 0).toLocaleString()}`, icon: <TrendingUp size={20} color="#16a34a" />, trend: '+12.5%', color: '#f0fdf4', border: '#bbf7d0' },
                                { label: 'Active Orders', value: orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length, icon: <ShoppingBag size={20} color="#f59e0b" />, trend: 'Running', color: '#fffbeb', border: '#fef08a' },
                                { label: 'Total Registered Shops', value: users.length, icon: <Users size={20} color="#6366f1" />, trend: 'Verified', color: '#eef2ff', border: '#e0e7ff' },
                                { label: 'Active Wholesale Agencies', value: agencies.length, icon: <Store size={20} color="#ec4899" />, trend: 'Active', color: '#fdf2f8', border: '#fce7f3' },
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '1.5rem', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ padding: '0.75rem', background: stat.color, border: `1px solid ${stat.border}`, borderRadius: 14 }}>{stat.icon}</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '0.2rem 0.6rem', borderRadius: 99 }}>{stat.trend}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mid-Section: Insights & Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            
                            {/* Order Dynamics */}
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: 28, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Order Velocity</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Real-time Distribution</div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {ORDER_STATUSES.map(s => {
                                        const count = orders.filter(o => o.status === s).length;
                                        const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                                        return (
                                            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700 }}>
                                                    <span style={{ color: '#475569' }}>{s}</span>
                                                    <span style={{ color: '#0f172a' }}>{count} ({pct.toFixed(0)}%)</span>
                                                </div>
                                                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: s === 'Delivered' ? '#16a34a' : (s === 'Cancelled' ? '#ef4444' : '#6366f1'), borderRadius: 99 }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Cash Flow</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{orders.filter(o => o.payment_method === 'Cash').reduce((acc, o) => acc + o.total_amount, 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Online Flow</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{orders.filter(o => o.payment_method === 'Online').reduce((acc, o) => acc + o.total_amount, 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Marketplace Activity */}
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: 28, border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recent Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {orders.slice(0, 6).map((o, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingBag size={18} color="#16a34a" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>New Order from {o.user_id?.name || 'Owner'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{o.products?.length || 0} Items · ₹{o.total_amount} · {new Date(o.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                            <Badge status={o.status} />
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No recent activity found.</p>}
                                </div>
                            </div>

                        </div>

                        {/* Bottom Section: Top Performers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem' }}>Top Growth Agencies</h4>
                                {agencies.slice(0, 3).map((a, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{i + 1}</div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{a.store_name}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 800 }}>Reliable</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem' }}>Inventory Status</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>SKU Count</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{products.length} Items</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Low Stock</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{products.filter(p => p.stock < 10).length} SKU</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ── ORDERS ── */}
                {tab === 'orders' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>All Orders</h2>
                        {orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || o.user_id?.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                                <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                                <p>{searchQuery ? 'No orders match your search.' : 'No orders yet.'}</p>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 1000 }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                {['Customer', 'Order ID', 'Agency', 'Items', 'Amount', 'Pay Type', 'Pay Status', 'Order Status', 'Date', 'View'].map(h => (
                                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || o.user_id?.name.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>{o.user_id?.name || '—'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.user_id?.phone || ''}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{o.user_id?.address || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.order_id?.slice(-8) || o._id.slice(-8)}</td>
                                                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.8125rem' }}>{o.vendor_id?.store_name || '—'}</td>
                                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>{o.products?.length || 0} SKU</td>
                                                    <td style={{ padding: '1rem', fontWeight: 700 }}>₹{o.total_amount}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {(o as any).payment_method === 'Online'
                                                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem' }}><CreditCard size={13} /> Online</span>
                                                            : <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 700, fontSize: '0.8rem' }}><Banknote size={13} /> Cash</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={o.payment_status} onChange={e => updateOrder(o._id, { payment_status: e.target.value })}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none', color: o.payment_status === 'Paid' ? '#16a34a' : '#dc2626' }}>
                                                            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={o.status} onChange={e => updateOrder(o._id, { status: e.target.value })}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none' }}>
                                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button onClick={() => { setSelected(o); setModal('orderDetails'); }} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}>
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

                {/* ── PRODUCTS (Marketplace) ── */}
                {tab === 'products' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>Marketplace Inventory</h2>
                            <button onClick={() => { setSelected(null); setModal('product'); }} style={{ padding: '0.6rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} /> Add Global Product</button>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 900 }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Product', 'Category', 'Agency', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                            <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name_en} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                                        ) : (
                                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#94a3b8' }}>No Img</div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name_en}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.name_hi}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#64748b' }}>{p.category}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.8125rem', color: '#475569' }}>{p.vendor_id?.store_name || 'System'}</td>
                                                <td style={{ padding: '1rem', fontWeight: 700 }}>₹{p.price}/{p.unit}</td>
                                                <td style={{ padding: '1rem', color: '#64748b' }}>{p.stock}</td>
                                                <td style={{ padding: '1rem' }}><Badge status={p.status} /></td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => { setSelected(p); setModal('product'); }} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                        <button onClick={() => deleteItem('products', p._id)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USERS (Shop Owners) ── */}
                {tab === 'users' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Registered Shop Owners</h2>
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Name', 'Phone', 'Address', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                                                <td style={{ padding: '1rem', color: '#475569' }}>{u.phone}</td>
                                                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>{u.address}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => deleteItem('users', u._id)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── AGENCIES ── */}
                {tab === 'agencies' && (
                    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.125rem' }}>Wholesale Agencies</h2>
                            <button onClick={() => { setSelected(null); setModal('vendor'); }} style={{ padding: '0.6rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} /> Add Agency</button>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Store Name', 'Owner', 'Phone', 'Address', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agencies.filter(a => a.store_name.toLowerCase().includes(searchQuery.toLowerCase())).map(a => (
                                            <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>{a.store_name}</td>
                                                <td style={{ padding: '1rem', color: '#475569' }}>{a.name}</td>
                                                <td style={{ padding: '1rem', color: '#475569' }}>{a.phone}</td>
                                                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>{a.address || 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => { setSelected(a); setModal('vendor'); }} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                        <button onClick={() => deleteItem('agencies', a._id)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL: Order Details ── */}
            {modal === 'orderDetails' && selected && (
                <Modal title={`Order Details: #${selected.order_id?.slice(-8) || selected._id.slice(-8)}`} onClose={() => setModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Placed On</div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                                <Badge status={selected.status} />
                                <Badge status={selected.payment_status} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Profile</div>
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selected.user_id?.name || 'Unknown User'}</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>📞 {selected.user_id?.phone}</div>
                                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>📍 {selected.user_id?.address}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Agency Details</div>
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selected.vendor_id?.store_name || 'Direct Order'}</div>
                                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Payment Type: <strong>{selected.payment_method || 'N/A'}</strong></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Order Items</div>
                            <div style={{ border: '1.5px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Item</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.products?.map((p: any, i: number) => (
                                            <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name_en} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain' }} />
                                                        ) : (
                                                            <div style={{ width: 24, height: 24, borderRadius: 4, background: '#f1f5f9' }} />
                                                        )}
                                                        <span>{p.name_en || 'Product'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{p.quantity}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>₹{p.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#0f172a', color: '#fff' }}>
                                            <td colSpan={2} style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Grand Total</td>
                                            <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 900, fontSize: '1rem' }}>₹{selected.total_amount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* History */}
                        {userHistory.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Customer Profile (Order History)</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 180, overflow: 'auto' }}>
                                    {userHistory.slice(0, 5).map(ho => (
                                        <div key={ho._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem', background: '#fefce8', border: '1px solid #fef08a', borderRadius: 12 }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>#{ho.order_id?.slice(-6)} · ₹{ho.total_amount}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#854d0e' }}>{new Date(ho.createdAt).toLocaleDateString()} · {ho.status}</div>
                                            </div>
                                            <Badge status={ho.status} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* ── MODAL: Product (Add/Edit) ── */}
            {modal === 'product' && (
                <Modal title={selected ? 'Edit Global Product' : 'Add New Global Product'} onClose={() => setModal(null)}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        const body = {
                            name_en: f.get('name_en'), name_hi: f.get('name_hi'), category: f.get('category'),
                            price: Number(f.get('price')), stock: Number(f.get('stock')), unit: f.get('unit'),
                            min_qty: Number(f.get('min_qty')), status: f.get('status'), offer: f.get('offer'),
                            image_url: f.get('image_url'), vendor_id: f.get('vendor_id') || undefined
                        };
                        const url = '/api/admin/products';
                        const method = selected ? 'PATCH' : 'POST';
                        const payload = selected ? { productId: selected._id, ...body } : body;
                        await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                        setModal(null); load();
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <SI label="Name (EN)"><Inp name="name_en" defaultValue={selected?.name_en} required /></SI>
                            <SI label="Name (HI)"><Inp name="name_hi" defaultValue={selected?.name_hi} required /></SI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <SI label="Category">
                                <select name="category" defaultValue={selected?.category || 'Oil'} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                                    {['Oil', 'Pulses', 'Rice', 'Spices', 'Sugar', 'Flour', 'Dry Fruits', 'Staples', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </SI>
                            <SI label="Agency (Optional)">
                                <select name="vendor_id" defaultValue={selected?.vendor_id?._id || ''} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                                    <option value="">System (Global)</option>
                                    {agencies.map(a => <option key={a._id} value={a._id}>{a.store_name}</option>)}
                                </select>
                            </SI>
                        </div>
                        <SI label="Product Image URL"><Inp name="image_url" defaultValue={selected?.image_url} placeholder="https://example.com/photo.jpg" /></SI>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <SI label="Price (₹)"><Inp name="price" type="number" defaultValue={selected?.price} required /></SI>
                            <SI label="Stock"><Inp name="stock" type="number" defaultValue={selected?.stock} required /></SI>
                            <SI label="Unit"><Inp name="unit" defaultValue={selected?.unit || 'kg'} required /></SI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <SI label="Min Qty"><Inp name="min_qty" type="number" defaultValue={selected?.min_qty || 1} required /></SI>
                            <SI label="Status">
                                <select name="status" defaultValue={selected?.status || 'In Stock'} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </SI>
                        </div>
                        <SI label="Active Offer"><Inp name="offer" defaultValue={selected?.offer} placeholder="e.g. 10% Off on 5 Packs" /></SI>
                        <button type="submit" style={{ padding: '0.875rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>{selected ? 'Update Product' : 'Add to Marketplace'}</button>
                    </form>
                </Modal>
            )}

            {/* ── MODAL: Agency (Add/Edit) ── */}
            {modal === 'vendor' && (
                <Modal title={selected ? 'Edit Agency' : 'Register New Wholesale Agency'} onClose={() => setModal(null)}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        const body: any = {};
                        f.forEach((v, k) => { body[k] = v; });
                        const url = '/api/admin/agencies';
                        const method = selected ? 'PATCH' : 'POST';
                        const payload = selected ? { vendorId: selected._id, ...body } : body;
                        const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                        if (res.ok) { setModal(null); load(); } else { alert('Error saving agency'); }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <SI label="Agency Head Name"><Inp name="name" defaultValue={selected?.name} required /></SI>
                        <SI label="Store/Agency Name"><Inp name="store_name" defaultValue={selected?.store_name} required /></SI>
                        <SI label="Full Address"><Inp name="store_address" defaultValue={selected?.store_address || selected?.address} required /></SI>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <SI label="GST Number"><Inp name="gst_number" defaultValue={selected?.gst_number} required /></SI>
                            <SI label="Turnover"><Inp name="turnover" defaultValue={selected?.turnover} placeholder="e.g. 10 Cr+" /></SI>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <SI label="Phone Number"><Inp name="phone" defaultValue={selected?.phone} required /></SI>
                            <SI label="Email Address"><Inp name="email" type="email" defaultValue={selected?.email} required /></SI>
                        </div>
                        <SI label={selected ? 'Update Password (Optional)' : 'Portal Password'}><Inp name="password" type="password" required={!selected} /></SI>
                        <button type="submit" style={{ padding: '0.875rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>{selected ? 'Update Agency Profile' : 'Register Agency'}</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
