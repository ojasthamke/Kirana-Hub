'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, Search, Leaf, Sparkles, MoreVertical, Info, Tag, Store, ChevronDown, ListFilter, ArrowRight, Plus, Briefcase, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiFetch, getApiUrl } from '@/lib/api';

interface Variant {
    variant_name: string;
    price: number;
    stock: number;
    unit: string;
    min_qty: number;
    offer?: string;
    status: 'In Stock' | 'Out of Stock';
}

interface Vendor { _id: string; store_name: string; business_segments?: string[]; }
interface Product {
    _id: string; name_en: string; name_hi: string;
    image_url?: string;
    category: string; price: number; stock: number;
    unit: string; min_qty: number;
    offer?: string; status: 'In Stock' | 'Out of Stock';
    vendor_id?: Vendor;
    variants?: Variant[];
}

const CAT_ICONS: Record<string, string> = {
    Pulses: '🫘', Rice: '🌾', Staples: '🌿', 'Dry Fruits': '🥜',
    Spices: '🌶️', Oil: '🫙', Sugar: '🍯', Flour: '🌽', Other: '📦'
};

function CardMenu({ product, vendorName }: { product: Product; vendorName: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <MoreVertical size={16} />
            </button>
            {open && (
                <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpen(false); }} onTouchStart={(e) => { e.stopPropagation(); setOpen(false); }} />
                <div className="menu-pop" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', minWidth: 220, zIndex: 100, overflow: 'hidden' }}>
                    <style>{`
                        @keyframes menuPop { from { opacity: 0; transform: scale(0.9) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                        .menu-pop { animation: menuPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: top right; }
                    `}</style>
                    <div style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Supplier Information</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Store size={14} color="#16a34a" />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>{vendorName}</span>
                        </div>
                        {product.offer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#eff6ff', padding: '0.5rem', borderRadius: 10, marginTop: '0.5rem' }}>
                                <Tag size={14} color="#2563eb" />
                                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800 }}>{product.offer}</span>
                            </div>
                        )}
                    </div>
                </div>
                </>
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
    const [fetchError, setFetchError] = useState(false);
    const [userVertical, setUserVertical] = useState<string | null>(null);

    const loadProducts = () => {
        setLoading(true); setFetchError(false);
        apiFetch('/api/products').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setProducts(d); else setFetchError(true);
            setLoading(false);
        }).catch(() => { setFetchError(true); setLoading(false); });
    };

    const loadUser = () => {
        apiFetch('/api/user/profile').then(r => r.json()).then(d => setUserVertical(d.business_type || 'Other'));
    };

    useEffect(() => { 
        loadProducts(); 
        loadUser();
    }, []);

    // --- SWIPE LOGIC ---
    const touchStart = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart.current - touchEnd;
        if (Math.abs(diff) > 70) {
            const currentIndex = categories.indexOf(filter);
            if (diff > 0 && currentIndex < categories.length - 1) {
                setFilter(categories[currentIndex + 1]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (diff < 0 && currentIndex > 0) {
                setFilter(categories[currentIndex - 1]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const getQty = (id: string, vName?: string) => cart.find(i => i.productId === id && i.variantName === vName)?.quantity || 0;

    // ... handleUpdate ...

    const handleUpdate = (p: Product, newQty: number, variant?: Variant) => {
        const vName = variant?.variant_name;
        const price = variant ? variant.price : p.price;
        const minQty = variant ? variant.min_qty : p.min_qty;
        const unit = variant ? variant.unit : p.unit;

        if (newQty < 0) return;
        if (newQty === 0) { updateQuantity(p._id, 0, vName); return; }
        
        const finalQty = newQty < minQty ? minQty : newQty;
        addToCart({ 
            productId: p._id, variantName: vName, 
            name: vName ? `${p.name_en} (${vName})` : p.name_en, 
            imageUrl: p.image_url,
            price, quantity: finalQty, 
            vendorId: p.vendor_id?._id || '', 
            minQty: minQty 
        });
    };

    // 1. Get products available for the user's vertical
    const verticalProducts = products.filter(p => 
        !userVertical || userVertical === 'Other' || (p.vendor_id?.business_segments || []).includes(userVertical)
    );

    // 2. Derive categories from these products
    const categories = ['All', ...Array.from(new Set(verticalProducts.map(p => p.category)))];

    // 3. Apply final UI filters (Category + Search)
    const filtered = verticalProducts.filter(p => {
        const matchesCategory = filter === 'All' || p.category === filter;
        const matchesSearch = p.name_en.toLowerCase().includes(search.toLowerCase()) || (p.name_hi || '').includes(search);
        return matchesCategory && matchesSearch;
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (fetchError) return (
        <div style={{ height: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Info size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Connection Failed</h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', maxWidth: '380px', marginBottom: '1.5rem' }}>
                Your app is trying to connect to: <br/>
                <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: 4, display: 'inline-block', marginTop: '0.5rem', wordBreak: 'break-all', fontSize: '0.8rem', color: '#0f172a' }}>
                    {getApiUrl('/api/products')}
                </code>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '320px', marginBottom: '2rem' }}>
                If you are on a real phone, this link must be your computer's IP address (e.g. 192.168.x.x).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Retry Now</button>
                <button onClick={() => window.location.href = '/login'} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Switch Account</button>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                width: 120, height: 120, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite ease-in-out'
            }}>
                <img src="/logo.png" alt="KiranaHub" style={{ width: '100%', height: 'auto', animation: 'bounce 0.8s infinite alternate' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Marketplace</p>
                <div style={{ height: 4, width: 140, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', margin: '0 auto' }}>
                    <div style={{ height: '100%', width: '40%', background: '#16a34a', borderRadius: 99, animation: 'loadProgress 1.5s infinite ease-in-out' }} />
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes bounce { from { transform: translateY(2px); } to { transform: translateY(-4px); } }
                @keyframes loadProgress { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
            `}</style>
        </div>
    );

    return (
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '7rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.25rem' }}>

                {/* ── SEARCH (Now Solo at top) ── */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" placeholder="Search brands, products, packaging..." value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3.25rem', borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9375rem', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} />
                    </div>
                </div>

                <style>{`
                    @keyframes slideDownNav {
                        0% { transform: translateY(-30px); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                    .glass-nav::-webkit-scrollbar { display: none; }
                `}</style>

                {/* ── PREMIUM GLASSMORPHIC STICKY CATEGORY BAR ── */}
                <div className="glass-nav" style={{ 
                    position: 'sticky', top: 0, zIndex: 140, 
                    background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    padding: '1rem 0', margin: '0 -1.25rem 2rem', paddingLeft: '1.25rem', paddingRight: '1.25rem',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                    display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
                    animation: 'slideDownNav 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    boxShadow: '0 4px 24px -6px rgba(0,0,0,0.03)'
                }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => { setFilter(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
                            padding: '0.75rem 1.25rem', borderRadius: 99, border: '1px solid',
                            cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap', 
                            fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                            background: filter === cat ? '#0f172a' : 'rgba(255,255,255,0.9)', 
                            color: filter === cat ? '#fff' : '#475569',
                            borderColor: filter === cat ? '#0f172a' : 'rgba(226, 232, 240, 0.8)',
                            boxShadow: filter === cat ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none'
                        }}>
                           {CAT_ICONS[cat] && <span style={{ marginRight: 6, fontSize: '1rem' }}>{CAT_ICONS[cat]}</span>}
                           {cat}
                        </button>
                    ))}
                </div>

                {/* ── PRODUCT GRID ── */}
                {!loading && categories.filter(c => c !== 'All' && (filter === 'All' || filter === c)).map(cat => {
                    const catProducts = filtered.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;

                    return (
                        <div key={cat} style={{ marginBottom: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.5rem' }}>{CAT_ICONS[cat]}</div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>{cat}</h2>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {catProducts.map(product => (
                                    <div key={product._id} className="product-card" style={{ background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}>
                                        <style>{`
                                            .product-card:hover { transform: translateY(-6px) scale(1.01); boxShadow: 0 20px 40px -15px rgba(0,0,0,0.1); }
                                            .btn-tap:active { transform: scale(0.95); }
                                        `}</style>
                                        <div style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                                {/* Small Thumbnail */}
                                                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name_en} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                                                    ) : (
                                                        <Package size={24} strokeWidth={1.5} color="#cbd5e1" />
                                                    )}
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                           <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{product.name_en}</h3>
                                                           <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>{product.name_hi}</div>
                                                           {product.offer && (
                                                              <div style={{ marginTop: '0.35rem', color: '#2563eb', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🎁 {product.offer}</div>
                                                           )}
                                                        </div>
                                                        <CardMenu product={product} vendorName={product.vendor_id?.store_name || 'Direct'} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* REST OF THE VARIATIONS LISTING */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* Render base product only if there are no variants, or explicitly intended */}
                                                {(!product.variants || product.variants.length === 0) && (
                                                    <ProductVariationRow 
                                                        product={product} 
                                                        qty={getQty(product._id)} 
                                                        onUpdate={(q) => handleUpdate(product, q)}
                                                    />
                                                )}

                                                {/* Render variants if available */}
                                                {product.variants?.map((v) => (
                                                    <ProductVariationRow 
                                                        key={v.variant_name}
                                                        product={product}
                                                        variant={v}
                                                        qty={getQty(product._id, v.variant_name)}
                                                        onUpdate={(q) => handleUpdate(product, q, v)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}`}</style>
        </div>
    );
}

function ProductVariationRow({ product, variant, qty, onUpdate }: { product: Product; variant?: Variant; qty: number; onUpdate: (q: number) => void }) {
    const isBase = !variant;
    const name = variant ? variant.variant_name : (product.unit || 'Standard');
    const price = variant ? variant.price : product.price;
    const unit = variant ? variant.unit : product.unit;
    const minQty = variant ? variant.min_qty : product.min_qty;
    const inStock = (variant?.status || product.status) === 'In Stock';

    return (
        <div style={{ background: qty > 0 ? '#f0fdf4' : '#f8fafc', padding: '1rem', borderRadius: 16, border: '1.5px solid', borderColor: qty > 0 ? '#16a34a' : '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>Variation</div>
                   <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>{name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>Price</div>
                   <div style={{ fontSize: '1.125rem', fontWeight: 900, fontFamily: 'Outfit,sans-serif' }}>₹{price}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/{unit}</span></div>
                </div>
            </div>

            {minQty > 1 && (
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: 6, width: 'fit-content' }}>
                    Min. {minQty} {unit} Required
                </div>
            )}

            {!inStock ? (
                <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 12, textAlign: 'center', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700 }}>Out of Stock</div>
            ) : qty === 0 ? (
                <button onClick={() => onUpdate(minQty)} style={{ width: '100%', padding: '0.75rem', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add to Cart
                </button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, border: '1.5px solid #16a34a', overflow: 'hidden' }}>
                    <button onClick={() => onUpdate(qty - 1)} style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>−</button>
                    <input type="number" value={qty} onFocus={(e) => e.target.select()} onChange={(e) => onUpdate(parseInt(e.target.value) || 0)} 
                        style={{ flex: 1, border: 'none', textAlign: 'center', fontWeight: 900, background: 'transparent', outline: 'none', fontSize: '1rem' }} />
                    <button onClick={() => onUpdate(qty + 1)} style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 700, color: '#16a34a' }}>+</button>
                </div>
            )}
        </div>
    );
}
