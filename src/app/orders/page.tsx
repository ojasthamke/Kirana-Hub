'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Loader2, Calendar, Banknote, CreditCard, RefreshCw, Trash2, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Order {
    _id: string;
    order_id?: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    createdAt: string;
    vendor_id?: { store_name: string; phone: string };
    products: any[];
}

const Badge = ({ s }: { s: string }) => {
    const m: Record<string, string[]> = {
        Delivered: ['#dcfce7', '#15803d'],
        Paid: ['#dcfce7', '#15803d'],
        Cancelled: ['#fee2e2', '#dc2626'],
        Unpaid: ['#fee2e2', '#dc2626'],
        Pending: ['#fef9c3', '#92400e'],
        Processing: ['#dbeafe', '#1d4ed8'],
        Accepted: ['#dbeafe', '#1d4ed8'],
        'Out for Delivery': ['#ede9fe', '#6d28d9'],
        Cash: ['#fef3c7', '#d97706'],
        Online: ['#eff6ff', '#2563eb'],
    };
    const [bg, color] = m[s] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s}</span>;
};

export default function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editingProducts, setEditingProducts] = useState<any[]>([]);

    const loadOrders = async () => {
        setError('');
        try {
            const res = await apiFetch('/api/orders');
            if (res.status === 401) {
                setError('Please login to view your orders.');
                setLoading(false);
                return;
            }
            const d = await res.json();
            if (d.error) {
                setError(d.error);
            } else if (Array.isArray(d)) {
                setOrders(d);
            }
        } catch {
            setError('Could not load orders. Please try again.');
        }
        setLoading(false);
    };

    const cancelOrder = async (id: string) => {
        if (!confirm('Cancel this order?')) return;
        await apiFetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Cancelled' }) });
        loadOrders();
        window.dispatchEvent(new CustomEvent('refresh-stats'));
    };

    const startEdit = (o: Order) => {
        setEditId(o._id);
        setEditingProducts(JSON.parse(JSON.stringify(o.products)));
    };

    const saveEdit = async (orderId: string) => {
        const res = await apiFetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products: editingProducts }) });
        if (res.ok) {
            setEditId(null);
            loadOrders();
            window.dispatchEvent(new CustomEvent('refresh-stats'));
        }
    };

    const updateQty = (idx: number, q: number) => {
        const u = [...editingProducts];
        const p = u[idx];
        if (q < (p.minQty || 1)) return;
        p.quantity = q;
        p.total = p.price * q;
        setEditingProducts(u);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Fetching your orders...</p>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{error}</h3>
                {error.includes('login') && (
                    <Link href="/login" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 2rem', background: '#0f172a', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>
                        Login Now
                    </Link>
                )}
            </div>
        </div>
    );

    const totalUnpaid = orders.filter(o => o.payment_status === 'Unpaid').reduce((s, o) => s + o.total_amount, 0);

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>My Orders</h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>History of all your wholesale purchases. Refreshes every 30s.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {totalUnpaid > 0 && (
                            <div style={{ padding: '0.625rem 1.125rem', background: '#fee2e2', borderRadius: 12, border: '1px solid #fecaca' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Unpaid</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#dc2626' }}>₹{totalUnpaid.toLocaleString()}</div>
                            </div>
                        )}
                        <button onClick={loadOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#475569' }}>
                            <RefreshCw size={15} /> Refresh
                        </button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: 24, border: '1px solid var(--gray-100)' }}>
                        <div style={{ width: 64, height: 64, background: 'var(--gray-50)', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 auto 1.5rem' }}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No orders found</h3>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '2rem' }}>You haven't placed any orders yet.</p>
                        <Link href="/" style={{ padding: '0.75rem 2rem', background: 'var(--gray-900)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {orders.map(o => (
                            <div key={o._id} style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                {/* Top bar */}
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order ID</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace' }}>#{o.order_id?.slice(-8) || o._id.slice(-8)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {o.status === 'Pending' && editId !== o._id && (
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={() => startEdit(o)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Edit2 size={12} /> Edit</button>
                                                <button onClick={() => cancelOrder(o._id)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Trash2 size={12} /> Cancel</button>
                                            </div>
                                        )}
                                        {editId === o._id && (
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={() => saveEdit(o._id)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Save</button>
                                                <button onClick={() => setEditId(null)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><X size={12} /> Exit</button>
                                            </div>
                                        )}
                                        <Badge s={o.status} />
                                        <Badge s={o.payment_status} />
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Calendar size={14} color="var(--gray-400)" />
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                                                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={14} color="var(--gray-400)" />
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{o.products?.length || 0} Products</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Agency</div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-800)' }}>{o.vendor_id?.store_name || 'Verified Agency'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{o.vendor_id?.phone}</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Payment</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {o.payment_method === 'Online'
                                                ? <><CreditCard size={15} color="#2563eb" /><span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>Online</span></>
                                                : <><Banknote size={15} color="#d97706" /><span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#d97706' }}>Cash on Delivery</span></>
                                            }
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Amount</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gray-900)' }}>₹{o.total_amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', color: o.payment_status === 'Paid' ? '#16a34a' : '#dc2626', fontWeight: 700, marginTop: 2 }}>
                                            {o.payment_status?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Product List with small photos */}
                                <div style={{ borderTop: '1.25px solid #f1f5f9', padding: '1.25rem', background: '#fcfcfd' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proper Ordered Items List</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{o.products?.length} Items</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        {(editId === o._id ? editingProducts : o.products)?.map((p: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                                        ) : (
                                                            <Package size={20} color="#cbd5e1" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{p.name || p.name_en || p.product_id?.name_en || 'Product'}</div>
                                                        {p.variant_name && (
                                                            <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 800, background: '#eff6ff', padding: '0.15rem 0.4rem', borderRadius: 4, display: 'inline-block', marginTop: 4, marginBottom: 4 }}>
                                                                {p.variant_name}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Unit Price: <span style={{ color: '#475569' }}>₹{p.price}</span></div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Qty</div>
                                                        {editId === o._id ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '0.2rem' }}>
                                                                <button onClick={() => updateQty(i, p.quantity - 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: '#64748b', width: 24 }}>-</button>
                                                                <input 
                                                                    type="number"
                                                                    value={p.quantity}
                                                                    onFocus={(e) => e.target.select()}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value) || 0;
                                                                        const limit = p.stock || Infinity;
                                                                        if (val > limit) {
                                                                            alert(`⚠️ Limit Hit: Only ${limit} units available.`);
                                                                            updateQty(i, limit);
                                                                        } else {
                                                                            updateQty(i, val);
                                                                        }
                                                                    }}
                                                                    placeholder="0"
                                                                    style={{ width: 45, border: 'none', textAlign: 'center', fontWeight: 900, background: 'transparent', outline: 'none', fontSize: '0.875rem' }} 
                                                                />
                                                                <button onClick={() => updateQty(i, p.quantity + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: '#64748b', width: 24 }}>+</button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>{p.quantity}</div>
                                                        )}
                                                    </div>
                                                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Subtotal</div>
                                                        <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a' }}>₹{p.total.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
