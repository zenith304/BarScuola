'use client';

import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

export function CartCount() {
    const { items } = useCart();
    // Use state to avoid hydration mismatch if localStorage is involved
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const count = items.reduce((a, b) => a + b.qty, 0);

    if (count === 0) return null;

    return (
        <span className="ml-1 inline-flex items-center justify-center -translate-y-0.5 bg-blue-100 text-blue-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {count}
        </span>
    );
}
