'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Loader2, Calendar, Banknote, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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

    const loadOrders = async () => {
        setError('');
        try {
            const res = await fetch('/api/orders');
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

    useEffect(() => {
        loadOrders();
        // Refresh every 30 seconds to see status updates
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
