'use client';

import { useState, useMemo } from 'react';
import { Product } from '@prisma/client';
import { Card } from '@/app/components/ui/Card';
import { AddToCartButton } from '@/app/components/AddToCartButton';
import { FavoriteButton } from '@/app/components/FavoriteButton';
import { ProductDetailsModal } from '@/app/components/ProductDetailsModal';
import { Search, X } from 'lucide-react';

interface ProductGridProps {
    menu: Record<string, Product[]>;
    bestSellerProductId?: string | null;
}

export function ProductGrid({ menu, bestSellerProductId }: ProductGridProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categories = Object.keys(menu);

    // Flatten products for search, but keep category structure for default view
    const filteredMenu = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const result: Record<string, Product[]> = {};

        categories.forEach(cat => {
            // If a category is selected, skip others
            if (activeCategory && activeCategory !== cat) return;

            const products = menu[cat].filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query));
                return matchesSearch;
            });

            if (products.length > 0) {
                result[cat] = products;
            }
        });

        return result;
    }, [menu, searchQuery, activeCategory, categories]);

    const handleCategoryClick = (cat: string) => {
        if (activeCategory === cat) {
            setActiveCategory(null); // Deselect
        } else {
            setActiveCategory(cat);
            // Scroll to top of grid
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setActiveCategory(null);
    };

    const hasResults = Object.keys(filteredMenu).length > 0;

    return (
        <div className="space-y-6">
            <ProductDetailsModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />

            {/* Sticky Search & Filter Header */}
            <div className="sticky top-4 z-40 space-y-3">
                <div className="relative shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cerca panini, bevande..."
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-800 rounded-xl leading-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-md transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`
                                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all
                                ${activeCategory === cat
                                    ? 'bg-blue-600 text-white shadow-md scale-105'
                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="min-h-[50vh]">
                {!hasResults ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 dark:bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nessun risultato trovato</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Prova a cercare qualcos'altro o cambia categoria.</p>
                        <button
                            onClick={clearSearch}
                            className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                            Mostra tutto il menu
                        </button>
                    </div>
                ) : (
                    Object.keys(filteredMenu).map((cat) => (
                        <section key={cat} id={cat} className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                {cat}
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {filteredMenu[cat].length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMenu[cat].map((product) => (
                                    <Card
                                        key={product.id}
                                        className="relative p-0 flex flex-col justify-between h-full group overflow-hidden border-border hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <FavoriteButton productId={product.id} />
                                        {product.id === bestSellerProductId && (
                                            <div className="absolute top-0 left-0 z-10">
                                                <div className="bg-amber-400 text-amber-900 text-[11px] font-black px-3 py-1 rounded-br-xl shadow-md flex items-center gap-1 tracking-wide">
                                                    🏆 Il più venduto
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2 pr-6">
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{product.name}</h3>
                                                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-sm whitespace-nowrap ml-2">
                                                    {(product.priceCents / 100).toFixed(2)}€
                                                </span>
                                            </div>
                                            {product.description && (
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-3">{product.description}</p>
                                            )}
                                            {product.allergens && (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                                    {product.allergens}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="p-4 bg-muted/30 border-t border-border mt-auto"
                                            onClick={(e) => e.stopPropagation()} // Prevent opening modal when clicking 'Add to Cart' area
                                        >
                                            <AddToCartButton product={product} />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
