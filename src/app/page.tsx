'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Search, Plus, Minus, Leaf, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string;
    name_en: string;
    name_hi: string;
    category: string;
    price: number;
    stock: number;
    offer?: string;
    status: 'In Stock' | 'Out of Stock';
    vendor_id?: { _id: string; store_name: string };
}

const CATEGORY_ICONS: Record<string, string> = {
    Pulses: '🫘', Rice: '🌾', Staples: '🌿', 'Dry Fruits': '🥜', Spices: '🌶️',
    Oil: '🫙', Sugar: '🍬', Flour: '🌽', Default: '📦'
};

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const { cart, addToCart, updateQuantity } = useCart();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setProducts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const getQty = (id: string) => cart.find(i => i.productId === id)?.quantity || 0;

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
        <div className="page-wrapper">
            <div className="container">

                {/* Hero Banner */}
                <div className="hero-banner animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Leaf size={16} color="var(--accent)" />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                    Wholesale Prices • Direct from Vendors
                                </span>
                            </div>
                            <h1 className="hero-title">India's Smartest<br />Kirana Marketplace</h1>
                            <p className="hero-subtitle" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                Order from multiple vendors in a single cart. Best wholesale rates.
                            </p>
                            <div className="search-bar">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search dal, rice, spices..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                            {[
                                { label: 'Verified Vendors', val: '50+' },
                                { label: 'Products Listed', val: '2,000+' },
                                { label: 'Orders Completed', val: '15,000+' },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                                    <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{s.val}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.1rem' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Filter Chips */}
                <div className="category-chips">
                    {categories.map(cat => (
                        <button key={cat} className={`chip ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                            {cat !== 'All' && <span>{CATEGORY_ICONS[cat] || CATEGORY_ICONS.Default}</span>} {cat}
                        </button>
                    ))}
                </div>

                {/* Results label */}
                {!loading && (
                    <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                            Showing <strong style={{ color: 'var(--gray-900)' }}>{filtered.length}</strong> products
                            {filter !== 'All' && <> in <strong style={{ color: 'var(--gray-900)' }}>{filter}</strong></>}
                        </p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="loading-page">
                        <div className="spinner" />
                        <p>Fetching products...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} strokeWidth={1} />
                        <h3>No products found</h3>
                        <p>Try a different category or search term.</p>
                    </div>
                ) : (
                    <div className="products-grid stagger">
                        {filtered.map(product => {
                            const qty = getQty(product._id);
                            const inStock = product.status === 'In Stock';
                            const emoji = CATEGORY_ICONS[product.category] || CATEGORY_ICONS.Default;

                            return (
                                <div key={product._id} className="product-card animate-fade-in">
                                    {/* Image area */}
                                    <div className="product-image">
                                        <span style={{ fontSize: '3.5rem', filter: 'grayscale(20%)' }}>{emoji}</span>
                                        {product.offer && (
                                            <div style={{
                                                position: 'absolute', top: '0.625rem', right: '0.625rem',
                                                background: 'var(--blue)', color: '#fff',
                                                fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.6rem',
                                                borderRadius: 'var(--radius-full)', letterSpacing: '0.04em'
                                            }}>
                                                <Sparkles size={10} style={{ display: 'inline', marginRight: 3 }} />
                                                {product.offer}
                                            </div>
                                        )}
                                        {!inStock && (
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="product-body">
                                        <span className="label" style={{ marginBottom: '0.375rem' }}>{product.category}</span>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{product.name_en}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontWeight: 500, marginBottom: '0.875rem' }}>{product.name_hi}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--gray-900)' }}>
                                                    ₹{product.price}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>per unit</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>Vendor</div>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                                                    {product.vendor_id?.store_name || 'Verified Store'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Qty stepper & Add to Cart */}
                                        {inStock ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                                <div className="qty-stepper">
                                                    <button className="qty-btn" onClick={() => handleUpdate(product, qty - 1)} disabled={qty <= 0}>−</button>
                                                    <input
                                                        type="number"
                                                        className="qty-input"
                                                        value={qty}
                                                        onChange={e => handleUpdate(product, parseInt(e.target.value) || 0)}
                                                    />
                                                    <button className="qty-btn" onClick={() => handleUpdate(product, qty + 1)}>+</button>
                                                </div>
                                                <button
                                                    className={`btn w-full ${qty > 0 ? 'btn-accent' : 'btn-outline'}`}
                                                    disabled={qty <= 0}
                                                    onClick={() => handleUpdate(product, qty || 1)}
                                                >
                                                    <ShoppingCart size={16} />
                                                    {qty > 0 ? `Added (${qty})` : 'Add to Cart'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-outline w-full" disabled style={{ color: 'var(--red)', borderColor: 'var(--red-light)' }}>
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
        </div>
    );
}
