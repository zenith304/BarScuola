'use client';

import { Product } from '@prisma/client';
import { useCart } from '@/app/context/CartContext';
import { Button } from './ui/Button';
import { ProductOptionsModal } from './ProductOptionsModal';
import { useState } from 'react';

interface AddToCartButtonProps {
    product: any; // Product with options
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart, updateQty, items, removeFromCart } = useCart();
    const [showModal, setShowModal] = useState(false);
    const inCart = items.find(i => i.productId === product.id);

    const hasOptions = product.options && product.options.length > 0;

    function handleAddClick() {
        if (hasOptions) {
            setShowModal(true);
        } else {
            addToCart(product);
        }
    }

    function handleConfirmOptions(selections: Record<string, string[]>) {
        // Format: "Salse: Ketchup, Maionese; Bevanda: Coca Cola"
        const formatted = Object.entries(selections)
            .map(([name, choices]) => `${name}: ${choices.join(', ')}`)
            .join('; ');
        addToCart(product, formatted);
        setShowModal(false);
    }

    return (
        <div className="w-full space-y-2">
            {(inCart && (!hasOptions || items.filter(i => i.productId === product.id).length === 1)) ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-1 border border-emerald-100 dark:border-emerald-900/30">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-300"
                        onClick={() => updateQty(product.id, -1, inCart.selectedOptions)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14" /></svg>
                    </Button>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100 w-8 text-center">{inCart.qty}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-300"
                        onClick={() => {
                            if (hasOptions) {
                                // For options, we can't just "add" without confirming options. 
                                // But since we are in "single variant mode", maybe we assume same options?
                                // Safer: Trigger modal again? Or simply increment if user wants SAME thing?
                                // User asked for "+", usually means "Same Thing".
                                updateQty(product.id, 1, inCart.selectedOptions);
                            } else {
                                addToCart(product);
                            }
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </Button>
                </div>
            ) : (
                <>
                    <Button
                        className="w-full"
                        onClick={handleAddClick}
                        disabled={!product.isAvailable}
                    >
                        {product.isAvailable ? 'Aggiungi al carrello' : 'Non disponibile'}
                    </Button>

                    {inCart && hasOptions && (
                        <div className="text-center">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded inline-block">
                                ✓ Aggiunto ({inCart.qty})
                            </span>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <ProductOptionsModal
                    productName={product.name}
                    options={product.options}
                    onConfirm={handleConfirmOptions}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

