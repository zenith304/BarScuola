'use client';

import { useEffect, useState } from 'react';
import { getProductsByIds } from '@/app/actions/shop';
import { Product } from '@prisma/client';
import { Card } from '@/app/components/ui/Card';
import { AddToCartButton } from '@/app/components/AddToCartButton';
import { Heart } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

export function QuickReorder() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        const saved = localStorage.getItem('bar-scuola-favorites');
        if (saved) {
            try {
                const ids = JSON.parse(saved);
                if (Array.isArray(ids) && ids.length > 0) {
                    const data = await getProductsByIds(ids);
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } catch (e) {
                console.error('Failed to load favorites', e);
            }
        } else {
            setProducts([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadFavorites();

        const handleUpdate = () => loadFavorites();
        window.addEventListener('favorites-updated', handleUpdate);
        return () => window.removeEventListener('favorites-updated', handleUpdate);
    }, []);

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
                <Heart className="text-red-500 fill-red-500" size={20} />
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">I tuoi Preferiti</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {products.map((product) => (
                    <Card key={product.id} className="min-w-[280px] md:min-w-[320px] snap-center p-0 flex flex-col justify-between relative group border-border hover:border-red-200 dark:hover:border-red-900/50">
                        <FavoriteButton productId={product.id} />
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2 pr-8">
                                <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                            </div>
                            <p className="font-bold text-red-500 mb-2">{(product.priceCents / 100).toFixed(2)}€</p>
                            {product.description && (
                                <p className="text-muted-foreground text-xs line-clamp-2 mb-3 h-8">{product.description}</p>
                            )}
                        </div>
                        <div className="p-3 bg-muted/30 border-t border-border mt-auto">
                            <AddToCartButton product={product} size="sm" />
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
