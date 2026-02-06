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
            {inCart && !hasOptions ? (
                <div className="flex items-center justify-between bg-green-50 rounded-md p-1 border border-green-200">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-700 hover:bg-green-100 hover:text-green-900"
                        onClick={() => updateQty(product.id, -1)}
                    >
                        -
                    </Button>
                    <span className="font-bold text-green-900 w-8 text-center">{inCart.qty}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-700 hover:bg-green-100 hover:text-green-900"
                        onClick={() => addToCart(product)}
                    >
                        +
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
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
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

