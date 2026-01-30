'use client';

import { Product } from '@prisma/client';
import { useCart } from '@/app/context/CartContext';
import { Button } from './ui/Button';

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart, items } = useCart();
    const inCart = items.find(i => i.productId === product.id);

    if (inCart) {
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">Added ({inCart.qty})</span>
                <Button size="sm" variant="secondary" onClick={() => addToCart(product)}>+</Button>
            </div>
        )
    }

    return (
        <Button
            className="w-full"
            onClick={() => addToCart(product)}
            disabled={!product.isAvailable}
        >
            {product.isAvailable ? 'Aggiungi al carrello' : 'Non disponibile'}
        </Button>
    );
}
