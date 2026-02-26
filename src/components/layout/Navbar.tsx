'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, LogOut, LayoutGrid, ShieldCheck, Store, User } from 'lucide-react';
import { TokenPayload } from '@/lib/auth';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const IS_LOCAL = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';

export default function Navbar({ session }: { session: TokenPayload | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 200, height: 65,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex', alignItems: 'center',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

                {/* Logo */}
                <Link href={session?.role === 'admin' ? '/admin' : session?.role === 'vendor' ? '/vendor' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', textDecoration: 'none', flexShrink: 0 }}>
                    <Store size={20} color="var(--accent)" strokeWidth={2.5} />
                    Kirana<span style={{ color: 'var(--accent)' }}>Hub</span>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {IS_LOCAL && (
                        // LOCAL MODE: Show all portals freely — no login needed
                        <>
                            <Link href="/" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname === '/' ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname === '/' ? 'var(--gray-100)' : 'transparent', textDecoration: 'none' }}>🛍️ Shop</Link>
                            <Link href="/admin" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname.startsWith('/admin') ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname.startsWith('/admin') ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={14} color="var(--accent)" /> Admin</Link>
                            <Link href="/vendor" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname.startsWith('/vendor') ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname.startsWith('/vendor') ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Store size={14} /> Vendor</Link>
                            <Link href="/cart" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname === '/cart' ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname === '/cart' ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShoppingCart size={14} /> Cart{totalItems > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: '0.6rem', padding: '1px 5px', fontWeight: 800 }}>{totalItems}</span>}</Link>
                        </>
                    )}
                    {!IS_LOCAL && session?.role === 'user' && (
                        <>
                            <Link href="/" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname === '/' ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname === '/' ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s' }}>Marketplace</Link>
                            <Link href="/orders" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname === '/orders' ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname === '/orders' ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s' }}>My Orders</Link>
                        </>
                    )}
                    {!IS_LOCAL && session?.role === 'vendor' && (
                        <Link href="/vendor" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><LayoutGrid size={16} /> Dashboard</Link>
                    )}
                    {!IS_LOCAL && session?.role === 'admin' && (
                        <Link href="/admin" style={{ padding: '0.4rem 0.75rem', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', color: pathname.startsWith('/admin') ? 'var(--gray-900)' : 'var(--gray-500)', background: pathname.startsWith('/admin') ? 'var(--gray-100)' : 'transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><ShieldCheck size={16} color="var(--accent)" /> Admin Portal</Link>
                    )}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {IS_LOCAL ? (
                        // LOCAL MODE badge — no login button
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: '#fef9c3', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: 99, letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid #fde68a' }}>🧪 Local Mode</span>
                        </div>
                    ) : session ? (
                        <>
                            {/* User info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {session.role === 'admin' ? <ShieldCheck size={16} color="var(--accent)" /> : session.role === 'vendor' ? <Store size={16} color="var(--gray-500)" /> : <User size={16} color="var(--gray-500)" />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-900)', maxWidth: 120, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session.name}</span>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: session.role === 'admin' ? 'var(--accent)' : session.role === 'vendor' ? 'var(--blue)' : 'var(--gray-400)' }}>{session.role}</span>
                                </div>
                            </div>
                            {/* Cart for users */}
                            {session.role === 'user' && (
                                <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none', transition: 'all 0.15s' }}>
                                    <ShoppingCart size={16} />
                                    Cart
                                    {totalItems > 0 && (
                                        <span style={{ position: 'absolute', top: -7, right: -7, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
                                    )}
                                </Link>
                            )}
                            {/* Logout */}
                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 8, border: '1.5px solid var(--gray-200)', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-500)', cursor: 'pointer', transition: 'all 0.15s' }}>
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" style={{ padding: '0.5rem 1.25rem', borderRadius: 8, background: 'var(--gray-900)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
