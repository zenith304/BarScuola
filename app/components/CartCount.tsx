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
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-200">
            {count}
        </span>
    );
}
