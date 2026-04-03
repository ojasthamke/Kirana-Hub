'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface CartItem {
    productId: string;
    variantName?: string; // e.g. "Box", "Pouch"
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    vendorId: string;
    minQty?: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => Promise<boolean>;
    updateQuantity: (productId: string, qty: number, variantName?: string) => Promise<boolean>;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = async (item: CartItem) => {
        try {
            const res = await apiFetch('/api/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.productId, variantName: item.variantName, quantity: item.quantity })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Could not reserve stock.');
                return false;
            }

            setCart(prev => {
                const existing = prev.find(i => i.productId === item.productId && i.variantName === item.variantName);
                if (existing) {
                    return prev.map(i => (i.productId === item.productId && i.variantName === item.variantName) 
                        ? { ...i, quantity: item.quantity } : i);
                }
                return [...prev, item];
            });
            return true;
        } catch {
            alert('Please login to add items to cart.');
            return false;
        }
    };

    const updateQuantity = async (productId: string, qty: number, variantName?: string) => {
        try {
            const res = await apiFetch('/api/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, variantName, quantity: qty })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Could not update stock reservation.');
                return false;
            }

            setCart(prev => {
                if (qty <= 0) return prev.filter(i => !(i.productId === productId && i.variantName === variantName));
                return prev.map(i => (i.productId === productId && i.variantName === variantName) 
                    ? { ...i, quantity: qty } : i);
            });
            return true;
        } catch {
            return false;
        }
    };

    const clearCart = () => {
        cart.forEach(i => updateQuantity(i.productId, 0, i.variantName));
        setCart([]);
    };

    const totalItems = cart.length;
    const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
