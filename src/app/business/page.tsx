'use client';

import { useState, useEffect } from 'react';
import { Store, User, Phone, MapPin, Briefcase, ChevronRight, CheckCircle, Search, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const BUSINESS_TYPES = [
    { id: 'Kirana Store', emoji: '🏪' },
    { id: 'Restaurant / Dhaba', emoji: '🍽️' },
    { id: 'Medical Shop', emoji: '💊' },
    { id: 'Bakery', emoji: '🥐' },
    { id: 'Sweet Shop', emoji: '🍬' },
    { id: 'Tea / Juice Stall', emoji: '🍵' },
    { id: 'Canteen', emoji: '🥘' },
    { id: 'Supermarket', emoji: '🛒' },
    { id: 'Hotel', emoji: '🏨' },
    { id: 'Other', emoji: '🏢' },
];

export default function BusinessProfile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [passForm, setPassForm] = useState({ current: '', new: '' });
    const [passMsg, setPassMsg] = useState({ text: '', color: '' });

    const fetchProfile = async () => {
        try {
            const res = await apiFetch('/api/user/profile');
            const data = await res.json();
            if (data.error) window.location.href = '/login'; else setUser(data);
        } catch { window.location.href = '/login'; }
        setLoading(false);
    };

    useEffect(() => { fetchProfile(); }, []);

    const updateBusiness = async (type: string) => {
        setSaving(true);
        try {
            const res = await apiFetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ business_type: type })
            });
            const data = await res.json();
            if (data.success) { setUser(data.user); }
        } catch { }
        setSaving(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setPassMsg({ text: '', color: '' });
        try {
            const res = await apiFetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passForm.new, current_password: passForm.current })
            });
            const data = await res.json();
            if (data.success) {
                setPassMsg({ text: 'Password Updated Successfully!', color: '#16a34a' });
                setPassForm({ current: '', new: '' });
            } else {
                setPassMsg({ text: data.error || 'Failed to update password', color: '#dc2626' });
            }
        } catch { setPassMsg({ text: 'Error connecting to server', color: '#dc2626' }); }
        setSaving(false);
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ height: 2, width: 120, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', margin: '1rem auto' }}>
                    <div style={{ height: '100%', width: '40%', background: '#16a34a', animation: 'loadProgress 1.5s infinite ease' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Loading Business Profile...</p>
            </div>
            <style>{`@keyframes loadProgress { from { transform: translateX(-100%); } to { transform: translateX(250%); } }`}</style>
        </div>
    );

    const filteredTypes = BUSINESS_TYPES.filter(bt => bt.id.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ background: '#f8fafc', minHeight: '92vh', padding: '2.5rem 1.25rem' }}>
            <div style={{ maxWidth: 850, margin: '0 auto' }}>
                
                {/* Header Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 72, height: 72, background: '#16a34a', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px -4px rgba(22, 163, 74, 0.25)' }}>
                            <Briefcase size={36} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', margin: 0, color: '#0f172a' }}>Your Business</h1>
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>{user.business_type} account • Active Profile</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    {/* Left Col: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Profile Info */}
                        <div style={{ background: '#fff', borderRadius: 28, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '2rem' }}>Identity Details</h2>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <ProfileItem label="Full Name" value={user.name} icon={<User size={18} />} />
                                <ProfileItem label="Phone Number" value={user.phone} icon={<Phone size={18} />} />
                                <ProfileItem label="Physical Address" value={user.address} icon={<MapPin size={18} />} />
                            </div>
                        </div>

                        {/* Security */}
                        <div style={{ background: '#fff', borderRadius: 28, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>Account Security</h2>
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                        <input 
                                            type="password" 
                                            placeholder="Enter new password" 
                                            autoComplete="new-password"
                                            value={passForm.new}
                                            onChange={e => setPassForm(p => ({ ...p, new: e.target.value }))}
                                            required 
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.875rem', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '0.875rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                {passMsg.text && <div style={{ fontSize: '0.8125rem', color: passMsg.color, fontWeight: 700 }}>{passMsg.text}</div>}
                                <button type="submit" disabled={saving} style={{ padding: '0.875rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.5rem' }}>
                                    {saving ? 'Processing...' : 'Update & Save to Device'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Col: Business Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#fff', borderRadius: 28, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Business Category</h2>
                                {saving && <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>Saving Choice...</div>}
                            </div>

                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 500 }}>
                                If you decide to change your business type, the marketplace will remember this preference for you.
                            </p>

                            {/* Search Box */}
                            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="text" placeholder="Search categories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.875rem', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }} />
                            </div>

                            {/* List of Types */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', maxHeight: 310, overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {filteredTypes.map(bt => (
                                    <button key={bt.id} onClick={() => updateBusiness(bt.id)} disabled={saving} style={{
                                        padding: '1rem 0.75rem', borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s', border: '2px solid',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        background: user.business_type === bt.id ? '#0f172a' : '#f8fafc',
                                        borderColor: user.business_type === bt.id ? '#0f172a' : '#f1f5f9',
                                        color: user.business_type === bt.id ? '#fff' : '#64748b',
                                        boxShadow: user.business_type === bt.id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>{bt.emoji}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>{bt.id}</span>
                                        {user.business_type === bt.id && <CheckCircle size={14} color="#16a34a" fill="#16a34a" stroke="#fff" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#fff', borderRadius: 24, border: '1px dashed #e2e8f0', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Need to update your Phone or GST details? Please contact support.</p>
                </div>
            </div>
            
            <style>{`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
            `}</style>
        </div>
    );
}

function ProfileItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #f1f5f9' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{label}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
            </div>
        </div>
    );
}
