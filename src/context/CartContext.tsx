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
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('kirana_cart');
        if (saved) {
            try { setCart(JSON.parse(saved)); } catch { }
        }
        setIsLoaded(true);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('kirana_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = async (item: CartItem) => {
        const existing = cart.find(i => i.productId === item.productId && i.variantName === item.variantName);
        const prevCart = [...cart];

        // 🟢 OPTIMISTIC UPDATE: Update UI instantly
        setCart(prev => {
            if (existing) {
                return prev.map(i => (i.productId === item.productId && i.variantName === item.variantName) 
                    ? { ...i, quantity: item.quantity } : i);
            }
            return [...prev, item];
        });

        // 🟠 BACKGROUND: Reserve in DB
        try {
            const res = await apiFetch('/api/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    productId: item.productId, 
                    variantName: item.variantName, 
                    quantity: item.quantity 
                })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Inventory Locked: Could not reserve stock.');
                setCart(prevCart); // Revert
                return false;
            }
            return true;
        } catch {
            alert('Connection lost. Sync failed.');
            setCart(prevCart); // Revert
            return false;
        }
    };

    const updateQuantity = async (productId: string, qty: number, variantName?: string) => {
        const prevCart = [...cart];

        // 🟢 OPTIMISTIC UPDATE: Update UI instantly
        setCart(prev => {
            if (qty <= 0) return prev.filter(i => !(i.productId === productId && i.variantName === variantName));
            return prev.map(i => (i.productId === productId && i.variantName === variantName) 
                ? { ...i, quantity: qty } : i);
        });

        // 🟠 BACKGROUND: Update reservation in DB
        try {
            const res = await apiFetch('/api/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, variantName, quantity: qty })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Inventory issue.');
                setCart(prevCart); // Revert
                return false;
            }
            return true;
        } catch {
            setCart(prevCart); // Revert
            return false;
        }
    };

    const clearCart = () => {
        cart.forEach(i => apiFetch('/api/cart/reserve', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: i.productId, variantName: i.variantName, quantity: 0 }) 
        }));
        setCart([]);
    };

    const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
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
