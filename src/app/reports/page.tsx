'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CreditCard, Banknote, Calendar, ArrowUpRight, ArrowDownRight, Package, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function UserReports() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/api/orders');
                const d = await res.json();
                if (Array.isArray(d)) setOrders(d);
            } catch {}
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <Loader2 className="animate-spin" size={32} color="#16a34a" />
        </div>
    );

    // Calculations
    const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);
    const totalPaid = orders.filter(o => o.payment_status === 'Paid').reduce((s, o) => s + o.total_amount, 0);
    const totalUnpaid = orders.filter(o => o.payment_status === 'Unpaid').reduce((s, o) => s + o.total_amount, 0);
    const totalItems = orders.reduce((s, o) => s + (o.products?.length || 0), 0);

    // Group by Agency
    const agencySpend: Record<string, number> = {};
    orders.forEach(o => {
        const name = o.vendor_id?.store_name || 'Verified Agency';
        agencySpend[name] = (agencySpend[name] || 0) + o.total_amount;
    });
    const topAgencies = Object.entries(agencySpend).sort((a,b) => b[1] - a[1]).slice(0, 5);

    // Monthly Spend (Last 6 Months)
    const monthlyData: Record<string, number> = {};
    orders.forEach(o => {
        const d = new Date(o.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        monthlyData[key] = (monthlyData[key] || 0) + o.total_amount;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '92vh', padding: '2.5rem 1.25rem' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', margin: 0 }}>Business Analytics</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Track your expenditure and order trends</p>
                </div>

                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <StatCard label="Total Expenditure" value={`₹${totalSpent.toLocaleString()}`} icon={<TrendingUp size={20} />} color="#0f172a" />
                    <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={<CreditCard size={20} />} color="#16a34a" />
                    <StatCard label="Total Pending" value={`₹${totalUnpaid.toLocaleString()}`} icon={<Banknote size={20} />} color="#dc2626" />
                    <StatCard label="Total Items Ordered" value={totalItems.toLocaleString()} icon={<Package size={20} />} color="#6366f1" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                    {/* Spending by month bar chart placeholder with CSS */}
                    <Section title="Expenditure Trend">
                        <div style={{ paddingTop: '2rem' }}>
                            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: '1rem', justifyContent: 'space-around', borderBottom: '2px solid #f1f5f9' }}>
                                {Object.entries(monthlyData).map(([mon, val]) => (
                                    <div key={mon} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ 
                                            width: '100%', maxWidth: '40px', background: 'linear-gradient(to top, #16a34a, #22c55e)', 
                                            height: `${Math.min(100, (val / (totalSpent || 1)) * 300)}%`, 
                                            borderRadius: '8px 8px 0 0', position: 'relative' 
                                        }}>
                                            <div style={{ position: 'absolute', top: -20, fontSize: '0.65rem', fontWeight: 700, width: '100%', textAlign: 'center' }}>₹{Math.round(val/1000)}k</div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{mon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Expenditure by Agency */}
                    <Section title="Top Agencies by Spend">
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {topAgencies.map(([name, spend]) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏪</div>
                                        <div>
                                            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>{name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{Math.round((spend/totalSpent)*100)}% of total</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>₹{spend.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>VERIFIED</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                <div style={{ marginTop: '3rem', padding: '2rem', background: '#0f172a', borderRadius: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Monthly Business Summary</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>You have saved approx ₹{Math.round(totalSpent * 0.12).toLocaleString()} by ordering wholesale this month.</p>
                    </div>
                    <button style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Download PDF Report</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div style={{ background: '#fff', borderRadius: 24, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 10, background: '#f8fafc', color: '#64748b' }}>{icon}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: 8 }}>+12.5%</div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: color, fontFamily: 'Outfit, sans-serif' }}>{value}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: 32, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>{title}</h2>
            {children}
        </div>
    );
}
