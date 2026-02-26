'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Package, Loader2, Calendar, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    order_id?: string;
    total_amount: number;
    status: string;
    payment_status: string;
    createdAt: string;
    vendor_id?: { store_name: string; phone: string };
    products: any[];
}

const Badge = ({ s }: { s: string }) => {
    const m: Record<string, string[]> = {
        Delivered: ['#dcfce7', '#15803d'],
        Cancelled: ['#fee2e2', '#dc2626'],
        Pending: ['#fef9c3', '#92400e'],
        Processing: ['#dbeafe', '#1d4ed8'],
        Accepted: ['#dbeafe', '#1d4ed8'],
        'Out for Delivery': ['#ede9fe', '#6d28d9'],
    };
    const [bg, color] = m[s] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s}</span>;
};

export default function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setOrders(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Fetching your orders...</p>
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>My Orders</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>History of all your wholesale purchases.</p>
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
                            <div key={o._id} style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order ID</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace' }}>#{o.order_id?.slice(-8) || o._id.slice(-8)}</div>
                                    </div>
                                    <Badge s={o.status} />
                                </div>

                                <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <Calendar size={14} color="var(--gray-400)" />
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={14} color="var(--gray-400)" />
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{o.products?.length || 0} Products</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Store</div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-800)' }}>{o.vendor_id?.store_name || 'Verified Vendor'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{o.vendor_id?.phone}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Amount</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gray-900)' }}>₹{o.total_amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>{o.payment_status?.toUpperCase() || 'PAID'}</div>
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
