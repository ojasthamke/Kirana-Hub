'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ChevronRight, Store, ShieldCheck, User } from 'lucide-react';

const ROLES = [
    { id: 'user', label: 'Shop Owner', desc: 'Buy wholesale for your store', icon: <User size={20} /> },
    { id: 'vendor', label: 'Vendor', desc: 'Sell to verified shop owners', icon: <Store size={20} /> },
    { id: 'admin', label: 'Admin', desc: 'Marketplace management', icon: <ShieldCheck size={20} /> },
];

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<'user' | 'vendor' | 'admin'>('user');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role })
            });
            const data = await res.json();
            if (data.success) {
                if (role === 'admin') router.push('/admin');
                else if (role === 'vendor') router.push('/vendor');
                else router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-50)' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                        <Store size={22} color="var(--accent)" strokeWidth={2.5} />
                        KiranaHub
                    </Link>
                    <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>Welcome back</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Sign in to continue to your account</p>
                </div>

                {/* Role selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    {ROLES.map(r => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as any)}
                            style={{
                                padding: '0.875rem 0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${role === r.id ? 'var(--gray-900)' : 'var(--gray-200)'}`,
                                background: role === r.id ? 'var(--gray-900)' : 'var(--white)',
                                color: role === r.id ? '#fff' : 'var(--gray-600)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem'
                            }}
                        >
                            {r.icon}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Card */}
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                    {error && (
                        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: '0.875rem', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-field">
                            <label className="field-label">Phone Number</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Phone size={18} /></span>
                                <input className="input" type="tel" placeholder="Enter registered phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Lock size={18} /></span>
                                <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {role === 'vendor'
                            ? <><span>New vendor? </span><Link href="/register/vendor" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Apply here</Link></>
                            : <><span>Don't have an account? </span><Link href="/register/user" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Sign up</Link></>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
