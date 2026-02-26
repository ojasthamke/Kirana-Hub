'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, Search, Leaf, Sparkles, MoreVertical, Info, Tag, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string; name_en: string; name_hi: string;
    category: string; price: number; stock: number;
    unit: string; min_qty: number;
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

                        {/* Agency Info */}
                        <div style={{ padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#64748b' }}>
                            <Store size={14} color="#94a3b8" />
                            <span>Agency: {product.vendor_id?.store_name || 'Verified Agency'}</span>
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
                                Wholesale • Direct from Agencies
                            </span>
                        </div>

                        <div>
                            <h1 style={{ fontSize: 'clamp(1.625rem, 5vw, 2.75rem)', fontWeight: 900, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                                India's Smartest<br />Kirana Marketplace
                            </h1>
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

                {/* ── PRODUCTS BY CATEGORY ── */}
                {!loading && categories.filter(c => c !== 'All' && (filter === 'All' || filter === c)).map(cat => {
                    const catProducts = filtered.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;

                    return (
                        <div key={cat} style={{ marginBottom: '3.5rem', position: 'relative' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ height: 1, background: '#e2e8f0', flex: 1 }} />
                                <h2 style={{ padding: '0 2rem', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span>{CAT_ICONS[cat] || '📦'}</span> {cat}
                                </h2>
                                <div style={{ height: 1, background: '#e2e8f0', flex: 1 }} />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                                gap: '1.5rem',
                                padding: '0.5rem'
                            }}>
                                {catProducts.map(product => {
                                    const qty = getQty(product._id);
                                    const inStock = product.status === 'In Stock';

                                    return (
                                        <div key={product._id} style={{
                                            background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
                                            overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            transition: 'all 0.25s',
                                            display: 'flex', flexDirection: 'column',
                                            position: 'relative'
                                        }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', background: '#f0fdf4', padding: '0.2rem 0.6rem', borderRadius: 99 }}>{product.category}</span>
                                                        {product.offer && (
                                                            <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <Sparkles size={10} /> {product.offer}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CardMenu product={product} qty={qty} onAdd={() => handleAdd(product)} onRemove={() => updateQuantity(product._id, 0)} />
                                                </div>

                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.2 }}>{product.name_en}</h3>
                                                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600, marginBottom: '1rem' }}>{product.name_hi}</p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', marginTop: 'auto' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                                                            <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.04em', color: '#0f172a' }}>₹{product.price}</span>
                                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>/ {product.unit}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agency</div>
                                                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>{product.vendor_id?.store_name || 'Verified'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                                    <Package size={14} color="#94a3b8" />
                                                    <span>Min. Order Qty: <strong style={{ color: '#0f172a' }}>{product.min_qty} {product.unit}</strong></span>
                                                </div>

                                                {inStock ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #f1f5f9', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                                                            <button onClick={() => handleUpdate(product, qty - 1)} disabled={qty <= 0}
                                                                style={{ width: 44, height: 44, border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, cursor: qty <= 0 ? 'not-allowed' : 'pointer', color: qty <= 0 ? '#cbd5e1' : '#0f172a', transition: 'all 0.2s' }}>−</button>
                                                            <input type="number" value={qty} onChange={e => handleUpdate(product, parseInt(e.target.value) || 0)}
                                                                style={{ flex: 1, border: 'none', textAlign: 'center', fontSize: '1rem', fontWeight: 800, outline: 'none', padding: '0', background: 'transparent', minWidth: 0, color: '#0f172a' }} />
                                                            <button onClick={() => {
                                                                const nextQty = qty === 0 ? product.min_qty : qty + 1;
                                                                handleUpdate(product, nextQty);
                                                            }}
                                                                style={{ width: 44, height: 44, border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a', transition: 'all 0.2s' }}>+</button>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAdd(product)}
                                                            style={{
                                                                width: '100%', padding: '0.875rem', borderRadius: 14, border: 'none',
                                                                background: qty > 0 ? '#16a34a' : '#0f172a',
                                                                color: '#fff', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                                transition: 'all 0.2s',
                                                                boxShadow: qty > 0 ? '0 4px 12px rgba(22,163,74,0.2)' : '0 4px 12px rgba(15,23,42,0.1)'
                                                            }}>
                                                            <ShoppingCart size={18} />
                                                            {qty > 0 ? `Added (${qty})` : (product.min_qty > 1 ? `Add Min. ${product.min_qty} ${product.unit}` : 'Add to Cart')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button disabled style={{ width: '100%', padding: '0.875rem', borderRadius: 14, border: '2px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontSize: '0.9375rem', fontWeight: 800, cursor: 'not-allowed' }}>
                                                        Out of Stock
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Section Separator */}
                            <div style={{ height: '3rem', borderBottom: '1px solid #e2e8f0', marginTop: '1rem', boxShadow: '0 20px 20px -20px rgba(0,0,0,0.06)', margin: '0 2rem' }} />
                        </div>
                    );
                })}
            </div>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        @media (max-width: 480px) {
          input[type=number] { font-size: 1rem !important; }
        }
      `}</style>
        </div>
    );
}
