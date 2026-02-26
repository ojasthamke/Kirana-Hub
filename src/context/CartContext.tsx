'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    vendorId: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    updateQuantity: (productId: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === item.productId);
            if (existing) {
                return prev.map(i => i.productId === item.productId ? { ...i, quantity: item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const updateQuantity = (productId: string, qty: number) => {
        setCart(prev => {
            if (qty <= 0) return prev.filter(i => i.productId !== productId);
            return prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i);
        });
    };

    const clearCart = () => setCart([]);

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
