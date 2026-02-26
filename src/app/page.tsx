'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, Search, Leaf, Sparkles, MoreVertical, Info, Tag, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string; name_en: string; name_hi: string;
    category: string; price: number; stock: number;
    offer?: string; status: 'In Stock' | 'Out of Stock';
    vendor_id?: { _id: string; store_name: string };
}

const CAT_ICONS: Record<string, string> = {
    Pulses: '🫘', Rice: '🌾', Staples: '🌿', 'Dry Fruits': '🥜',
    Spices: '🌶️', Oil: '🫙', Sugar: '🍯', Flour: '🌽', Other: '📦'
};

// 3-dot dropdown component
function CardMenu({ product, qty, onAdd, onRemove }: {
    product: Product; qty: number;
    onAdd: () => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', minWidth: 180, zIndex: 100 }}>
                    <div style={{ padding: '0.5rem' }}>
                        {/* Option 1: Add to Cart */}
                        <button onClick={() => { onAdd(); setOpen(false); }} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textAlign: 'left' }}>
                            <ShoppingCart size={15} color="#16a34a" />
                            {qty > 0 ? `In Cart (${qty})` : 'Add to Cart'}
                        </button>

                        {/* Option 2: Remove from Cart */}
                        {qty > 0 && (
                            <button onClick={() => { onRemove(); setOpen(false); }} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#dc2626', textAlign: 'left' }}>
                                <Package size={15} color="#dc2626" />
                                Remove from Cart
                            </button>
                        )}

                        <div style={{ height: 1, background: '#f1f5f9', margin: '0.25rem 0' }} />

                        {/* Option 3: Vendor Info */}
                        <div style={{ padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#64748b' }}>
                            <Store size={14} color="#94a3b8" />
                            <span>{product.vendor_id?.store_name || 'Verified Store'}</span>
                        </div>

                        {/* Option: Offer / Price info */}
                        {product.offer && (
                            <div style={{ padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#2563eb' }}>
                                <Tag size={14} color="#2563eb" />
                                <span>{product.offer}</span>
                            </div>
                        )}

                        {/* Stock info */}
                        <div style={{ padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#64748b' }}>
                            <Info size={14} color="#94a3b8" />
                            <span>Stock: {product.stock} units</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const { cart, addToCart, updateQuantity } = useCart();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setProducts(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const getQty = (id: string) => cart.find(i => i.productId === id)?.quantity || 0;

    const handleAdd = (p: Product) => {
        const qty = getQty(p._id);
        addToCart({ productId: p._id, name: p.name_en, price: p.price, quantity: qty + 1, vendorId: p.vendor_id?._id || '' });
    };

    const handleUpdate = (p: Product, newQty: number) => {
        if (newQty < 0) return;
        if (newQty === 0) { updateQuantity(p._id, 0); return; }
        addToCart({ productId: p._id, name: p.name_en, price: p.price, quantity: newQty, vendorId: p.vendor_id?._id || '' });
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const filtered = products.filter(p =>
        (filter === 'All' || p.category === filter) &&
        (p.name_en.toLowerCase().includes(search.toLowerCase()) || p.name_hi.includes(search))
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.25rem' }}>

                {/* ── HERO ── */}
                <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 50%, #14532d 100%)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1.5rem', position: 'relative'
                }}>
                    {/* Mobile: stack vertically */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Leaf size={14} color="#4ade80" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Wholesale • Direct from Vendors
                            </span>
                        </div>

                        <div>
                            <h1 style={{ fontSize: 'clamp(1.625rem, 5vw, 2.75rem)', fontWeight: 900, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                                India's Smartest<br />Kirana Marketplace
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.875rem,2vw,1rem)', marginBottom: '1.25rem' }}>
                                Order from multiple vendors. Best wholesale rates.
                            </p>
                        </div>

                        {/* Search */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                            <Search size={18} color="rgba(255,255,255,0.5)" />
                            <input
                                type="text" placeholder="Search dal, rice, spices..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9375rem', width: '100%' }}
                            />
                        </div>

                        {/* Stats row — horizontal scroll on mobile */}
                        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                            {[{ v: '50+', l: 'Vendors' }, { v: '2,000+', l: 'Products' }, { v: '15K+', l: 'Orders' }].map((s, i) => (
                                <div key={i} style={{ flexShrink: 0, padding: '0.625rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', minWidth: 90, textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', lineHeight: 1.2 }}>{s.v}</div>
                                    <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── CATEGORY CHIPS ── */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} style={{
                            flexShrink: 0, padding: '0.4375rem 1rem', borderRadius: 99, border: '1.5px solid',
                            borderColor: filter === cat ? '#0f172a' : '#e2e8f0',
                            background: filter === cat ? '#0f172a' : '#fff',
                            color: filter === cat ? '#fff' : '#475569',
                            fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap'
                        }}>
                            {cat !== 'All' && <span>{CAT_ICONS[cat] || '📦'}</span>} {cat}
                        </button>
                    ))}
                </div>

                {/* ── RESULTS COUNT ── */}
                {!loading && (
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.125rem' }}>
                        Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> products
                        {filter !== 'All' && <> in <strong style={{ color: '#0f172a' }}>{filter}</strong></>}
                    </p>
                )}

                {/* ── LOADING ── */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
                        <p>Fetching products...</p>
                    </div>
                )}

                {/* ── EMPTY ── */}
                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1.5px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                        <Package size={48} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontWeight: 700, marginBottom: '0.375rem' }}>No products found</h3>
                        <p style={{ fontSize: '0.875rem' }}>Try searching something else.</p>
                    </div>
                )}

                {/* ── PRODUCTS GRID ── */}
                {!loading && filtered.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                        gap: 'clamp(0.75rem, 2vw, 1.25rem)'
                    }}>
                        {filtered.map(product => {
                            const qty = getQty(product._id);
                            const inStock = product.status === 'In Stock';
                            const emoji = CAT_ICONS[product.category] || '📦';

                            return (
                                <div key={product._id} style={{
                                    background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
                                    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                                >
                                    {/* Body */}
                                    <div style={{ padding: '1.25rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#16a34a' }}>{product.category}</span>
                                                {product.offer && (
                                                    <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <Sparkles size={10} /> {product.offer}
                                                    </span>
                                                )}
                                            </div>
                                            {/* 3-DOT MENU */}
                                            <CardMenu product={product} qty={qty} onAdd={() => handleAdd(product)} onRemove={() => updateQuantity(product._id, 0)} />
                                        </div>

                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.125rem', lineHeight: 1.3 }}>{product.name_en}</h3>
                                        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.75rem' }}>{product.name_hi}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', marginTop: 'auto' }}>
                                            <div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.03em', color: '#0f172a' }}>₹{product.price}</div>
                                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>per unit</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Vendor</div>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>{product.vendor_id?.store_name || 'Verified'}</div>
                                            </div>
                                        </div>

                                        {/* Add to cart */}
                                        {inStock ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                                    <button onClick={() => handleUpdate(product, qty - 1)} disabled={qty <= 0}
                                                        style={{ width: 40, height: 40, border: 'none', background: 'transparent', fontSize: '1.125rem', fontWeight: 700, cursor: qty <= 0 ? 'not-allowed' : 'pointer', color: qty <= 0 ? '#cbd5e1' : '#0f172a', flexShrink: 0 }}>−</button>
                                                    <input type="number" value={qty} onChange={e => handleUpdate(product, parseInt(e.target.value) || 0)}
                                                        style={{ flex: 1, border: 'none', textAlign: 'center', fontSize: '0.9375rem', fontWeight: 700, outline: 'none', padding: '0', background: 'transparent', minWidth: 0 }} />
                                                    <button onClick={() => handleUpdate(product, qty + 1)}
                                                        style={{ width: 40, height: 40, border: 'none', background: 'transparent', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a', flexShrink: 0 }}>+</button>
                                                </div>
                                                <button
                                                    onClick={() => handleAdd(product)}
                                                    style={{
                                                        width: '100%', padding: '0.625rem', borderRadius: 10, border: 'none',
                                                        background: qty > 0 ? '#16a34a' : '#0f172a',
                                                        color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                                        transition: 'background 0.15s'
                                                    }}>
                                                    <ShoppingCart size={15} />
                                                    {qty > 0 ? `Added (${qty})` : 'Add to Cart'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button disabled style={{ width: '100%', padding: '0.625rem', borderRadius: 10, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontSize: '0.875rem', fontWeight: 700, cursor: 'not-allowed' }}>
                                                Out of Stock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        @media (max-width: 480px) {
          input[type=number] { font-size: 1rem !important; }
        }
      `}</style>
        </div>
    );
}
