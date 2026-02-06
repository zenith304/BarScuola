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
    const { addToCart, items } = useCart();
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
            <Button
                className="w-full"
                onClick={handleAddClick}
                disabled={!product.isAvailable}
            >
                {product.isAvailable ? 'Aggiungi al carrello' : 'Non disponibile'}
            </Button>

            {inCart && (
                <div className="text-center">
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                        ✓ Aggiunto al carrello {hasOptions ? '' : `(${inCart.qty})`}
                    </span>
                </div>
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

