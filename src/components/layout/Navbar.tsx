'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, LayoutGrid, ShieldCheck, Store, User } from 'lucide-react';
import { TokenPayload } from '@/lib/auth';
import { useCart } from '@/context/CartContext';

export default function Navbar({ session }: { session: TokenPayload | null }) {
    const pathname = usePathname();
    const { totalItems } = useCart();

    return (
        <nav className="navbar">
            <div className="container nav-inner">
                {/* Logo */}
                <Link href="/" className="logo">
                    <Store size={20} color="var(--accent)" strokeWidth={2.5} />
                    Kirana<span style={{ color: 'var(--accent)' }}>Hub</span>
                    <span className="logo-dot" />
                </Link>

                {/* Nav Links */}
                <div className="nav-links">
                    {!session && (
                        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                            Marketplace
                        </Link>
                    )}

                    {session?.role === 'admin' && (
                        <Link href="/admin" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>
                            <ShieldCheck size={16} style={{ display: 'inline', marginRight: 4 }} />
                            Admin Portal
                        </Link>
                    )}

                    {session?.role === 'vendor' && (
                        <>
                            <Link href="/vendor" className={`nav-link ${pathname.startsWith('/vendor') ? 'active' : ''}`}>
                                <LayoutGrid size={16} style={{ display: 'inline', marginRight: 4 }} />
                                Dashboard
                            </Link>
                        </>
                    )}

                    {session?.role === 'user' && (
                        <>
                            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Marketplace</Link>
                            <Link href="/orders" className={`nav-link ${pathname === '/orders' ? 'active' : ''}`}>My Orders</Link>
                        </>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            <div className="nav-user" style={{ gap: '0.5rem' }}>
                                <div style={{
                                    width: '2rem', height: '2rem', borderRadius: '50%',
                                    background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <User size={16} color="var(--gray-500)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.2 }}>{session.name}</div>
                                    <span className="nav-badge">{session.role}</span>
                                </div>
                            </div>
                            <div className="nav-divider" />
                            {session.role === 'user' && (
                                <Link href="/cart" style={{ position: 'relative' }}>
                                    <button className="btn btn-outline btn-sm flex gap-2">
                                        <ShoppingCart size={16} />
                                        Cart
                                        {totalItems > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-6px', right: '-6px',
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                background: 'var(--accent)', color: '#fff',
                                                fontSize: '0.625rem', fontWeight: 800,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>{totalItems}</span>
                                        )}
                                    </button>
                                </Link>
                            )}
                            <form action="/api/auth/logout" method="POST">
                                <button className="btn btn-ghost btn-sm">
                                    <LogOut size={15} /> Logout
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link href="/register/vendor" className="btn btn-primary btn-sm">
                                Become a Vendor
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
