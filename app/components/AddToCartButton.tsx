'use client';

import { Product } from '@prisma/client';
import { useCart, CartItem } from '@/app/context/CartContext';
import { Button } from './ui/Button';
import { ProductOptionsModal } from './ProductOptionsModal';
import { RemoveVariantModal } from './RemoveVariantModal';
import { useState } from 'react';

interface AddToCartButtonProps {
    product: any; // Product with options
    size?: 'default' | 'sm';
}

export function AddToCartButton({ product, size = 'default' }: AddToCartButtonProps) {
    const { addToCart, updateQty, items } = useCart();
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    // Get all cart items matching this product ID
    const productVariants = items.filter(i => i.productId === product.id);
    const totalQty = productVariants.reduce((sum, item) => sum + item.qty, 0);

    const hasOptions = product.options && product.options.length > 0;

    function handleAddClick() {
        if (hasOptions) {
            // Always open modal for products with options to force explicit selection
            setShowOptionsModal(true);
        } else {
            // Simple increment for products without options
            addToCart(product);
        }
    }

    function handleRemoveClick() {
        if (productVariants.length > 1) {
            // Multiple variants exist, ask user which one to remove
            setShowRemoveModal(true);
        } else if (productVariants.length === 1) {
            // Only one variant, just decrement it
            updateQty(product.id, -1, productVariants[0].selectedOptions);
        }
    }

    function handleConfirmOptions(selections: Record<string, string[]>) {
        // Format: "Salse: Ketchup, Maionese; Bevanda: Coca Cola"
        const formatted = Object.entries(selections)
            .map(([name, choices]) => `${name}: ${choices.join(', ')}`)
            .join('; ');
        addToCart(product, formatted);
        setShowOptionsModal(false);
    }

    function handleConfirmRemove(variant: CartItem) {
        updateQty(product.id, -1, variant.selectedOptions);
        setShowRemoveModal(false);
    }

    return (
        <div className="w-full space-y-2">
            {totalQty > 0 ? (
                <div className={`flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-1 border border-emerald-100 dark:border-emerald-900/30 ${size === 'sm' ? 'h-8' : ''}`}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-full aspect-square p-0 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-300"
                        onClick={handleRemoveClick}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14" /></svg>
                    </Button>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100 min-w-8 text-center text-sm">{totalQty}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-full aspect-square p-0 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-300"
                        onClick={handleAddClick}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </Button>
                </div>
            ) : (
                <Button
                    className={`w-full ${size === 'sm' ? 'h-8 text-xs' : ''}`}
                    onClick={handleAddClick}
                    disabled={!product.isAvailable}
                >
                    {product.isAvailable ? (size === 'sm' ? 'Aggiungi' : 'Aggiungi al carrello') : 'Non disponibile'}
                </Button>
            )}

            {showOptionsModal && (
                <ProductOptionsModal
                    productName={product.name}
                    options={product.options}
                    onConfirm={handleConfirmOptions}
                    onCancel={() => setShowOptionsModal(false)}
                />
            )}

            {showRemoveModal && (
                <RemoveVariantModal
                    productName={product.name}
                    variants={productVariants}
                    onRemove={handleConfirmRemove}
                    onCancel={() => setShowRemoveModal(false)}
                />
            )}
        </div>
    );
}

