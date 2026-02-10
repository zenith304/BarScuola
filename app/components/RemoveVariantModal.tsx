'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CartItem } from '@/app/context/CartContext';

interface RemoveVariantModalProps {
    productName: string;
    variants: CartItem[];
    onRemove: (variant: CartItem) => void;
    onCancel: () => void;
}

export function RemoveVariantModal({ productName, variants, onRemove, onCancel }: RemoveVariantModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Rimuovi: {productName}</h2>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Hai diverse varianti di questo prodotto nel carrello. Quale vuoi rimuovere?
                </p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {variants.map((variant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                            onClick={() => onRemove(variant)}>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                    {variant.selectedOptions || 'Base (Nessuna opzione)'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                    Qtà: {variant.qty}
                                </span>
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={onCancel} className="w-full">Annulla</Button>
                </div>
            </Card>
        </div>,
        document.body
    );
}
