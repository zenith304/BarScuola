'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
    productId: string;
    name: string;
    priceCents: number;
    qty: number;
    selectedOptions?: string; // e.g., "Salse: Ketchup, Maionese"
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any, selectedOptions?: string) => void;
    removeFromCart: (productId: string, selectedOptions?: string) => void;
    updateQty: (productId: string, delta: number, selectedOptions?: string) => void;
    clearCart: () => void;
    totalCents: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bar-scuola-cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('bar-scuola-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, selectedOptions?: string) => {
        setItems(prev => {
            // Find item with same product AND same options
            const existing = prev.find(i =>
                i.productId === product.id &&
                (i.selectedOptions || '') === (selectedOptions || '')
            );
            if (existing) {
                return prev.map(i =>
                    (i.productId === product.id && (i.selectedOptions || '') === (selectedOptions || ''))
                        ? { ...i, qty: i.qty + 1 }
                        : i
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                qty: 1,
                selectedOptions
            }];
        });
    };

    const removeFromCart = (productId: string, selectedOptions?: string) => {
        setItems(prev => prev.filter(i =>
            !(i.productId === productId && (i.selectedOptions || '') === (selectedOptions || ''))
        ));
    };

    const updateQty = (productId: string, delta: number, selectedOptions?: string) => {
        setItems(prev => prev.map(i => {
            if (i.productId === productId && (i.selectedOptions || '') === (selectedOptions || '')) {
                const newQty = Math.max(1, i.qty + delta);
                return { ...i, qty: newQty };
            }
            return i;
        }));
    };

    const clearCart = () => setItems([]);

    const totalCents = items.reduce((sum, i) => sum + (i.priceCents * i.qty), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalCents }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
