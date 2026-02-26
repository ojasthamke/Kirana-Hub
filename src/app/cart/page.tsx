'use client';

import { useState } from 'react';
import { ShoppingBag, Trash2, ChevronRight, CheckCircle, Package, ShoppingCart, CreditCard, Banknote, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function PaymentModal({ total, onConfirm, onClose }: { total: number; onConfirm: (method: 'Cash' | 'Online') => void; onClose: () => void }) {
    const [method, setMethod] = useState<'Cash' | 'Online'>('Cash');
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Choose Payment Method</h2>
                    <button onClick={onClose} style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                </div>

                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Order Total: <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</strong>
                </p>

                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    {[
                        { id: 'Cash', label: 'Pay on Delivery (Cash)', sub: 'Pay when the order arrives', icon: <Banknote size={24} color="#16a34a" /> },
                        { id: 'Online', label: 'Online Payment', sub: 'UPI, Card, Net Banking', icon: <CreditCard size={24} color="#2563eb" /> },
                    ].map(opt => (
                        <button key={opt.id} onClick={() => setMethod(opt.id as any)} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '1rem 1.25rem', borderRadius: 16,
                            border: `2px solid ${method === opt.id ? (opt.id === 'Cash' ? '#16a34a' : '#2563eb') : '#f1f5f9'}`,
                            background: method === opt.id ? (opt.id === 'Cash' ? '#f0fdf4' : '#eff6ff') : '#f8fafc',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                        }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: method === opt.id ? '#fff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {opt.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{opt.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{opt.sub}</div>
                            </div>
                            {method === opt.id && <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', background: opt.id === 'Cash' ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={14} color="#fff" />
                            </div>}
                        </button>
                    ))}
                </div>

                <button onClick={() => onConfirm(method)} style={{
                    width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #0f172a, #1e3a2f)',
                    color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                    Confirm & Place Order <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

export default function CartPage() {
    const { cart, updateQuantity, clearCart, totalPrice } = useCart();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleCheckout = async (paymentMethod: 'Cash' | 'Online') => {
        setShowPaymentModal(false);
        setCheckingOut(true);
        setError('');
        try {
            const res = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
                    payment_method: paymentMethod
                })
            });
            const data = await res.json();
            if (data.success) { setOrderId(data.masterOrderId); clearCart(); }
            else setError(data.error || 'Failed to place order. Please try again.');
        } catch { setError('Please login to checkout.'); }
        finally { setCheckingOut(false); }
    };

    if (orderId) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 420 }} className="animate-scale">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }} className="animate-check">
                    <CheckCircle size={42} color="#fff" />
                </div>
                <h2 style={{ marginBottom: '0.625rem' }}>Order Placed!</h2>
                <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Your wholesale order is being processed.</p>
                <p style={{ marginBottom: '2rem' }}>Master Order ID: <strong style={{ color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>{orderId}</strong></p>
                <Link href="/orders" className="btn btn-primary btn-lg">Track My Orders</Link>
            </div>
        </div>
    );

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>Shopping Cart</h1>
                        <p>{cart.length > 0 ? `${cart.reduce((a, i) => a + i.quantity, 0)} items ready for checkout` : 'Your cart is empty'}</p>
                    </div>
                    {cart.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={clearCart}>
                            <Trash2 size={15} /> Clear All
                        </button>
                    )}
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #fecaca' }}>
                        ⚠️ {error}
                    </div>
                )}

                {cart.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingCart size={52} strokeWidth={1} />
                        <h3>Nothing in your cart</h3>
                        <p>Browse the marketplace and add items at wholesale prices.</p>
                        <Link href="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map(item => (
                                <div key={item.productId} style={{
                                    background: 'var(--white)', border: '1px solid var(--gray-100)',
                                    borderRadius: 'var(--radius-lg)', padding: '1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s',
                                    flexWrap: 'wrap'
                                }}
                                    className="animate-fade-in cart-item"
                                >
                                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Package size={24} color="var(--gray-300)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9375rem', marginBottom: '0.125rem' }} className="truncate">{item.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>₹{item.price} × {item.quantity} = <strong style={{ color: '#0f172a' }}>₹{item.price * item.quantity}</strong></div>
                                    </div>
                                    <div className="qty-stepper">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 0}>−</button>
                                        <span className="qty-input" style={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--gray-900)' }}>₹{item.price * item.quantity}</div>
                                        <button style={{ fontSize: '0.75rem', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }} onClick={() => updateQuantity(item.productId, 0)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }} className="sticky-top">
                            <h3 style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-100)' }}>Order Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                                <div className="flex justify-between text-sm"><span style={{ color: 'var(--gray-500)' }}>Subtotal</span><span style={{ fontWeight: 600 }}>₹{totalPrice}</span></div>
                                <div className="flex justify-between text-sm"><span style={{ color: 'var(--gray-500)' }}>Delivery</span><span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8125rem' }}>FREE</span></div>
                                <div style={{ height: 1, background: 'var(--gray-100)' }} />
                                <div className="flex justify-between items-center">
                                    <span style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Total</span>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>₹{totalPrice}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary btn-lg w-full"
                                onClick={() => setShowPaymentModal(true)}
                                disabled={checkingOut}
                                style={{
                                    background: checkingOut ? '#94a3b8' : 'linear-gradient(135deg, #0f172a, #1e3a2f)',
                                    border: 'none'
                                }}
                            >
                                {checkingOut ? 'Placing Order...' : 'Choose Payment & Order'}
                                {!checkingOut && <ChevronRight size={18} />}
                            </button>
                            <p style={{ marginTop: '0.875rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                Orders auto-split agency-wise
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {showPaymentModal && (
                <PaymentModal
                    total={totalPrice}
                    onConfirm={handleCheckout}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}

            <style jsx>{`
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    .sticky-top {
                        position: static !important;
                    }
                }
                @media (max-width: 600px) {
                    .cart-item {
                        display: grid !important;
                        grid-template-areas: 
                            "img info info"
                            "img stepper price";
                        grid-template-columns: auto 1fr auto;
                        align-items: center;
                    }
                    .cart-item > div:nth-child(1) { grid-area: img; }
                    .cart-item > div:nth-child(2) { grid-area: info; }
                    .cart-item > div:nth-child(3) { grid-area: stepper; }
                    .cart-item > div:nth-child(4) { grid-area: price; margin-top: 0 !important; }

                    .qty-stepper {
                        height: 32px !important;
                    }
                    .qty-btn {
                        width: 32px !important;
                        height: 32px !important;
                    }
                    .qty-input {
                        width: 32px !important;
                        font-size: 0.85rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
