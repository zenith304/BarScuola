'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

export function FavoriteButton({ productId }: { productId: string }) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('bar-scuola-favorites');
        if (saved) {
            const ids = JSON.parse(saved);
            if (Array.isArray(ids) && ids.includes(productId)) {
                setIsFavorite(true);
            }
        }
    }, [productId]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent triggering card click if any
        e.stopPropagation();

        const saved = localStorage.getItem('bar-scuola-favorites');
        let ids: string[] = saved ? JSON.parse(saved) : [];

        if (ids.includes(productId)) {
            ids = ids.filter(id => id !== productId);
            setIsFavorite(false);
        } else {
            ids.push(productId);
            setIsFavorite(true);
        }

        localStorage.setItem('bar-scuola-favorites', JSON.stringify(ids));

        // Dispatch custom event so QuickReorder can update immediately
        window.dispatchEvent(new Event('favorites-updated'));
    };

    return (
        <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${isFavorite
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800'
                }`}
            title={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        >
            <Heart size={20} className={isFavorite ? "fill-current" : ""} />
        </button>
    );
}
