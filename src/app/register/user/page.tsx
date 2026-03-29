'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, MapPin, ChevronRight, CheckCircle, Store } from 'lucide-react';

const BUSINESS_TYPES = [
    { id: 'Kirana Store', emoji: '🏪', label: 'Kirana Store' },
    { id: 'Restaurant / Dhaba', emoji: '🍽️', label: 'Restaurant / Dhaba' },
    { id: 'Medical Shop', emoji: '💊', label: 'Medical Shop' },
    { id: 'Bakery', emoji: '🥐', label: 'Bakery' },
    { id: 'Sweet Shop', emoji: '🍬', label: 'Sweet Shop' },
    { id: 'Tea / Juice Stall', emoji: '🍵', label: 'Tea / Juice Stall' },
    { id: 'Canteen', emoji: '🥘', label: 'Canteen / Mess' },
    { id: 'Supermarket', emoji: '🛒', label: 'Supermarket' },
    { id: 'Hotel', emoji: '🏨', label: 'Hotel' },
    { id: 'Other', emoji: '🏢', label: 'Other Business' },
];

export default function UserRegistration() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', phone: '', address: '', password: '', business_type: 'Kirana Store' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, store_address: form.address, role: 'user' })
            });
            const data = await res.json();
            if (data.success) setSuccess(true);
            else setError(data.error || 'Registration failed');
        } catch { setError('Something went wrong.'); }
        finally { setLoading(false); }
    };

    if (success) return (
        <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
            <div style={{ textAlign: 'center', maxWidth: 420 }} className="animate-scale">
                <div style={{ width: 80, height: 80, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }} className="animate-check">
                    <CheckCircle size={42} color="#fff" />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>You're all set!</h2>
                <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Your account is ready. Start ordering wholesale products for your store.</p>
                <Link href="/login" className="btn btn-primary btn-lg">Sign In Now</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-50)' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                        <Store size={22} color="var(--accent)" strokeWidth={2.5} />KiranaHub
                    </Link>
                    <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Register to start ordering wholesale</p>
                </div>

                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                    {error && <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: '0.875rem' }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Business Type */}
                        <div className="form-field">
                            <label className="field-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.625rem', display: 'block' }}>
                                What type of business do you run?
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                                {BUSINESS_TYPES.map(bt => (
                                    <button
                                        key={bt.id}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, business_type: bt.id }))}
                                        style={{
                                            padding: '0.625rem 0.5rem',
                                            borderRadius: 10,
                                            border: `1.5px solid ${form.business_type === bt.id ? '#0f172a' : '#e2e8f0'}`,
                                            background: form.business_type === bt.id ? '#0f172a' : '#f8fafc',
                                            color: form.business_type === bt.id ? '#fff' : '#475569',
                                            cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                                            fontSize: '0.75rem', fontWeight: 600,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{bt.emoji}</span>
                                        {bt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="field-label">Full Name</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><User size={18} /></span>
                                <input className="input" type="text" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Phone Number</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Phone size={18} /></span>
                                <input className="input" type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Store / Delivery Address</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><MapPin size={18} /></span>
                                <input className="input" type="text" placeholder="Delivery address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Lock size={18} /></span>
                                <input className="input" type="password" placeholder="Create password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'} {!loading && <ChevronRight size={18} />}
                        </button>
                    </form>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        Already have an account? <Link href="/login" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
