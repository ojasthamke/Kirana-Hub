'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Store, MapPin, Hash, Phone, Mail, Lock, ChevronRight, CheckCircle } from 'lucide-react';

export default function VendorRegistration() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '', store_name: '', store_address: '', gst_number: '',
        turnover: '', phone: '', alternate_phone: '', email: '', password: ''
    });

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, role: 'vendor' })
            });
            const data = await res.json();
            if (data.success) setStep(3);
            else setError(data.error || 'Registration failed');
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    };

    const InputField = ({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    {icon}
                </span>
                <input
                    {...props}
                    style={{
                        width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem',
                        border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9375rem', color: 'var(--gray-900)', background: 'var(--white)', outline: 'none',
                        transition: 'border-color 0.15s'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--gray-400)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; }}
                />
            </div>
        </div>
    );

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                        <Store size={22} color="var(--accent)" strokeWidth={2.5} />KiranaHub
                    </Link>
                </div>

                {/* Card */}
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                    {/* Card header */}
                    <div style={{ padding: '2.5rem 2.5rem 0' }}>
                        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.375rem' }}>Join KiranaHub</h1>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Grow your wholesale business by reaching thousands of local shops.</p>

                        {/* Step bar */}
                        {step < 3 && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
                                {[1, 2].map(s => (
                                    <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? 'var(--gray-900)' : 'var(--gray-200)', transition: 'background 0.4s' }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div style={{ padding: '0 2.5rem 2.5rem' }} className="animate-fade-in">
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem', display: 'block', marginBottom: '1.25rem' }}>
                                    Business Information
                                </span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <InputField label="Full Name" icon={<User size={17} />} type="text" placeholder="Owner's Name" value={form.name} onChange={set('name')} />
                                    <InputField label="Store Name" icon={<Store size={17} />} type="text" placeholder="Kalyan Wholesalers" value={form.store_name} onChange={set('store_name')} />
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <InputField label="Store Address" icon={<MapPin size={17} />} type="text" placeholder="Full shop address" value={form.store_address} onChange={set('store_address')} />
                                    </div>
                                    <InputField label="GST Number" icon={<Hash size={17} />} type="text" placeholder="22AAAAA0000A1Z5" value={form.gst_number} onChange={set('gst_number')} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-500)' }}>Approx Turnover</label>
                                        <select
                                            value={form.turnover} onChange={set('turnover')}
                                            style={{ padding: '0.75rem 2rem 0.75rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', fontSize: '0.9375rem', color: form.turnover ? 'var(--gray-900)' : 'var(--gray-400)', outline: 'none', appearance: 'none', background: "var(--white) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\") no-repeat right 0.875rem center", width: '100%' }}
                                        >
                                            <option value="" disabled>Select range</option>
                                            <option>Under 10L</option><option>10L – 50L</option><option>50L – 1Cr</option><option>1Cr+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)}>
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div style={{ padding: '0 2.5rem 2.5rem' }} className="animate-fade-in">
                            {error && <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: '0.875rem' }}>{error}</div>}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem', display: 'block', marginBottom: '1.25rem' }}>
                                Contact & Credentials
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <InputField label="Phone Number" icon={<Phone size={17} />} type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={set('phone')} />
                                <InputField label="Alternate Phone" icon={<Phone size={17} />} type="tel" placeholder="Optional" value={form.alternate_phone} onChange={set('alternate_phone')} />
                                <InputField label="Email ID" icon={<Mail size={17} />} type="email" placeholder="store@example.com" value={form.email} onChange={set('email')} />
                                <InputField label="Password" icon={<Lock size={17} />} type="password" placeholder="Create a secure password" value={form.password} onChange={set('password')} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                                <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application'} {!loading && <ChevronRight size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div style={{ padding: '1rem 2.5rem 3rem', textAlign: 'center' }} className="animate-scale">
                            <div style={{ width: 80, height: 80, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }} className="animate-check">
                                <CheckCircle size={42} color="#fff" />
                            </div>
                            <h2 style={{ marginBottom: '0.625rem' }}>Application Submitted!</h2>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem', maxWidth: 380, margin: '0 auto 2rem' }}>
                                Our team will review your GST and business details within 24–48 hours. You'll get a notification on your phone once approved.
                            </p>
                            <Link href="/" className="btn btn-primary btn-lg">Return to Marketplace</Link>
                        </div>
                    )}

                    {step < 3 && (
                        <div style={{ padding: '1.25rem 2.5rem', borderTop: '1px solid var(--gray-100)', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                            Already a vendor? <Link href="/login" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Sign in here</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
