'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Lock, ChevronRight, Store, ShieldCheck, User } from 'lucide-react';

import { getApiUrl } from '@/lib/api';

const ROLES = [
    { id: 'user', label: 'Shop Owner', icon: <User size={20} /> },
    { id: 'vendor', label: 'Agency', icon: <Store size={20} /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck size={20} /> },
];

export default function LoginClient() {
    const [role, setRole] = useState<'user' | 'vendor' | 'admin'>('user');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    // Diagnostic Check: Verify API Reachability on mount
    useEffect(() => {
        const url = getApiUrl('/api/auth/login');
        fetch(url).then(r => r.json()).then(d => {
            if (d.ok) setApiStatus('online');
            else setApiStatus('offline');
        }).catch(() => setApiStatus('offline'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const url = getApiUrl('/api/auth/login');
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({ phone, password, role })
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                console.error('Invalid JSON Response:', text);
                const isHtml = text.trim().startsWith('<');
                const titleMatch = text.match(/<title>(.*?)<\/title>/);
                const title = titleMatch ? ` [Page Title: ${titleMatch[1]}]` : '';
                
                if (isHtml) {
                    setError(`[v1.1] Network Misconfiguration: The server at ${url} returned an HTML page instead of API data.${title} This usually means a 404 or a redirect is happening.`);
                } else {
                    setError(`[v1.1] Server Error: Received status ${res.status}. Output snippet: ${text.substring(0, 30)}...`);
                }
                return;
            }
            
            if (data.success && data.token) {
                // Bridge: Manually set the cookie in the phone's webview
                // This ensures the page-level navigation (GET) can see the session
                document.cookie = `token=${data.token}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
                
                // Store in localStorage as a redundant backup for future mobile calls
                localStorage.setItem('auth_token', data.token);

                // Use hard navigation so the cookie is fully sent on the next request
                if (role === 'admin') window.location.href = '/admin';
                else if (role === 'vendor') window.location.href = '/agency';
                else window.location.href = '/';
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(`Network Error: ${err.message || 'Could not connect'}. Check your internet and server URL.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-50)' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
                        <img src="/logo.png" alt="KiranaHub" style={{ height: 100, width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>Welcome back</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Sign in to continue</p>
                </div>

                {/* Role selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    {ROLES.map(r => (
                        <button key={r.id} type="button" onClick={() => setRole(r.id as any)} style={{
                            padding: '0.875rem 0.5rem', borderRadius: 12,
                            border: `1.5px solid ${role === r.id ? 'var(--gray-900)' : 'var(--gray-200)'}`,
                            background: role === r.id ? 'var(--gray-900)' : '#fff',
                            color: role === r.id ? '#fff' : 'var(--gray-500)',
                            cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem'
                        }}>
                            {r.icon}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.label}</span>
                        </button>
                    ))}
                </div>

                {/* Diagnostic Badge */}
                <div style={{ 
                    marginBottom: '1rem', padding: '0.625rem 1rem', borderRadius: 12, 
                    background: apiStatus === 'online' ? '#f0fdf4' : apiStatus === 'offline' ? '#fef2f2' : '#f8fafc',
                    border: '1px solid', borderColor: apiStatus === 'online' ? '#bbf7d0' : apiStatus === 'offline' ? '#fecaca' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: apiStatus === 'online' ? '#22c55e' : apiStatus === 'offline' ? '#ef4444' : '#94a3b8', animation: apiStatus === 'checking' ? 'pulse 1s infinite' : 'none' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: apiStatus === 'online' ? '#166534' : apiStatus === 'offline' ? '#991b1b' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Backend Status: {apiStatus.toUpperCase()}
                    </span>
                    {apiStatus === 'offline' && <span style={{ fontSize: '0.6rem', color: '#dc2626' }}>(Check Link)</span>}
                </div>

                <form onSubmit={handleSubmit} style={{ background: 'var(--white)', padding: '2rem', borderRadius: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
                    {error && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)' }}>
                                {role === 'admin' ? 'Admin ID' : 'Phone Number'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex' }}>
                                    {role === 'admin' ? <ShieldCheck size={18} /> : <Phone size={18} />}
                                </span>
                                <input
                                    style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                                    type="text"
                                    placeholder={role === 'admin' ? 'Enter admin ID' : 'Enter registered phone'}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex' }}>
                                    <Lock size={18} />
                                </span>
                                <input
                                    style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem', background: 'var(--gray-900)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </div>

                    {role !== 'admin' && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                            {role === 'vendor'
                                ? <><span>New Agency? Contact </span><strong style={{ color: 'var(--gray-900)' }}>admin to get access</strong></>
                                : <><span>New here? </span><Link href="/register/user" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Create account</Link></>
                            }
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
