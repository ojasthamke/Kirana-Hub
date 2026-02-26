'use client';

import { useState } from 'react';
import { ShoppingBag, Trash2, ChevronRight, CheckCircle, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, updateQuantity, clearCart, totalPrice } = useCart();
    const [checkingOut, setCheckingOut] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            const res = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: cart.map(i => ({ productId: i.productId, quantity: i.quantity })) })
            });
            const data = await res.json();
            if (data.success) { setOrderId(data.masterOrderId); clearCart(); }
            else alert(data.error || 'Please login first.');
        } catch { alert('Please login to checkout.'); }
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
                        <p>{cart.length > 0 ? `${cart.reduce((a, i) => a + i.quantity, 0)} items from multiple vendors` : 'Your cart is empty'}</p>
                    </div>
                    {cart.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={clearCart}>
                            <Trash2 size={15} /> Clear All
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingCart size={52} strokeWidth={1} />
                        <h3>Nothing in your cart</h3>
                        <p>Browse the marketplace and add items at wholesale prices.</p>
                        <Link href="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map(item => (
                                <div key={item.productId} style={{
                                    background: 'var(--white)', border: '1px solid var(--gray-100)',
                                    borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                                    display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
                                }}
                                    className="animate-fade-in"
                                >
                                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Package size={24} color="var(--gray-300)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9375rem', marginBottom: '0.125rem' }} className="truncate">{item.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>₹{item.price} × {item.quantity}</div>
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
                            <button className="btn btn-primary btn-lg w-full" onClick={handleCheckout} disabled={checkingOut}>
                                {checkingOut ? 'Placing Order...' : 'Place Wholesale Order'}
                                {!checkingOut && <ChevronRight size={18} />}
                            </button>
                            <p style={{ marginTop: '0.875rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                Orders auto-split vendor-wise
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
