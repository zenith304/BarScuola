'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FloatingCartButton() {
    const { items } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const count = items.reduce((a, b) => a + b.qty, 0);

    if (count === 0) return null;

    return (
        <Link
            href="/cart"
            className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span className="font-bold text-lg hidden group-hover:inline-block whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-xs">
                Carrello ({count})
            </span>
            {/* Always show count if not hovering? Or maybe just show icon? 
                User said: "when you pass on it show 'Carrello [qty]'". 
                Let's make it so it's Icon initially, and expands on hover.
                But maybe show count in a badge always? 
                Let's try: Icon + Badge -> Hover: "Carrello [qty]"
            */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full group-hover:hidden">
                {count}
            </span>
        </Link>
    );
}
