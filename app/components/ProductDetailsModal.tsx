'use client';

import { Product } from '@prisma/client';
import { X } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useEffect, useRef } from 'react';

interface ProductDetailsModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-200 dark:border-slate-800"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Header / Image Placeholder if we had images */}
                <div className="bg-linear-to-br from-blue-500 to-indigo-600 h-32 flex items-end p-6">
                    <h2 className="text-2xl font-bold text-white shadow-sm">{product.name}</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {(product.priceCents / 100).toFixed(2)}€
                        </span>
                        {product.category && (
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {product.category}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Descrizione</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                            {product.description || "Nessuna descrizione disponibile."}
                        </p>
                    </div>

                    {product.allergens && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-500 text-sm mb-1 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                Allergeni
                            </h3>
                            <p className="text-amber-700 dark:text-amber-400 text-sm">
                                {product.allergens}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                        <AddToCartButton product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}
