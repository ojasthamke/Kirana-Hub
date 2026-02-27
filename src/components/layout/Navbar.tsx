'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, LogOut, LayoutGrid, ShieldCheck, Store, User, Menu, X, ChevronRight, Package, CreditCard } from 'lucide-react';
import { TokenPayload } from '@/lib/auth';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

const IS_LOCAL = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';

export default function Navbar({ session }: { session: TokenPayload | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems, totalPrice } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [unpaidAmount, setUnpaidAmount] = useState<number | null>(null);

    useEffect(() => {
        if (session && session.role === 'user') {
            fetch('/api/orders/unpaid-total')
                .then(r => r.json())
                .then(d => { if (typeof d.totalUnpaid === 'number') setUnpaidAmount(d.totalUnpaid); })
                .catch(() => { });
        }
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <>
            <nav style={{
                position: 'sticky', top: 0, zIndex: 200, height: 65,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex', alignItems: 'center',
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Left: Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', textDecoration: 'none', flexShrink: 0 }}>
                        <Store size={18} color="var(--accent)" strokeWidth={2.5} />
                        KiranaHub
                    </Link>

                    {/* Right: User + Options */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {session && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {session.role === 'user' && unpaidAmount !== null && unpaidAmount > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: 10, background: '#fff5f5', border: '1px solid #fee2e2', color: '#dc2626', marginRight: '0.4rem' }}>
                                        <CreditCard size={12} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>₹{unpaidAmount.toLocaleString()} Due</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.5rem', borderRadius: 12, background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-200)' }}>
                                        <User size={12} color="var(--gray-500)" />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem',
                                borderRadius: 10, border: '1.5px solid var(--gray-200)', background: menuOpen ? 'var(--gray-100)' : 'var(--white)',
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', cursor: 'pointer'
                            }}
                        >
                            {menuOpen ? <X size={16} /> : <Menu size={16} />}
                            <span className="hide-mobile">Options</span>
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute', top: '70px', right: '1rem', width: '220px',
                        background: '#fff', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid var(--gray-100)', zIndex: 300, padding: '0.5rem',
                        animation: 'fadeUp 0.2s ease-out'
                    }}>
                        {/* Session Role Info */}
                        {session && (
                            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--gray-50)', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '0.05em' }}>Logged in as</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.1rem' }}>{session.role}</div>
                            </div>
                        )}

                        {/* Nav Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {IS_LOCAL ? (
                                <>
                                    <MenuLink href="/" icon={<Store size={16} />} label="Marketplace" onClick={() => setMenuOpen(false)} />
                                    <MenuLink href="/admin" icon={<ShieldCheck size={16} />} label="Admin Portal" onClick={() => setMenuOpen(false)} />
                                    <MenuLink href="/agency" icon={<LayoutGrid size={16} />} label="Agency Panel" onClick={() => setMenuOpen(false)} />
                                    <MenuLink href="/cart" icon={<ShoppingCart size={16} />} label="My Cart" onClick={() => setMenuOpen(false)} />
                                </>
                            ) : session ? (
                                <>
                                    {session.role === 'user' && (
                                        <>
                                            <MenuLink href="/" icon={<Store size={16} />} label="Marketplace" onClick={() => setMenuOpen(false)} />
                                            <MenuLink href="/orders" icon={<Package size={16} />} label="My Orders" onClick={() => setMenuOpen(false)} />
                                            <MenuLink href="/cart" icon={<ShoppingCart size={16} />} label="My Cart" onClick={() => setMenuOpen(false)} />
                                        </>
                                    )}
                                    {session.role === 'vendor' && <MenuLink href="/agency" icon={<LayoutGrid size={16} />} label="Agency Dashboard" onClick={() => setMenuOpen(false)} />}
                                    {session.role === 'admin' && <MenuLink href="/admin" icon={<ShieldCheck size={16} />} label="Admin Portal" onClick={() => setMenuOpen(false)} />}
                                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <MenuLink href="/login" icon={<LogOut size={16} />} label="Sign In" onClick={() => setMenuOpen(false)} />
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Cart Bar */}
            {totalItems > 0 && pathname !== '/cart' && (
                <div className="bottom-cart-bar">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: 'var(--gray-900)', padding: '0.6rem 1rem', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            View Cart <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                }
                .bottom-cart-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #0f172a;
                    padding: 0.85rem 1.25rem;
                    z-index: 1000;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: block;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
            borderRadius: 10, textDecoration: 'none', color: 'var(--gray-700)',
            fontSize: '0.85rem', fontWeight: 600, transition: 'background 0.2s'
        }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ color: 'var(--gray-400)' }}>{icon}</span>
            {label}
        </Link>
    );
}
