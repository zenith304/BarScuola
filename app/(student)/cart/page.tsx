'use client';

import { useCart } from '@/app/context/CartContext';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react';
import { createOrder } from '@/app/actions/shop';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, removeFromCart, updateQty, totalCents, clearCart } = useCart();
    const router = useRouter();

    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName || !studentClass) {
            setError('Nome e Classe sono obbligatori');
            return;
        }
        if (items.length === 0) {
            setError('Il carrello è vuoto');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const order = await createOrder({
                studentName,
                studentClass,
                note,
                cart: items.map(i => ({ productId: i.productId, qty: i.qty }))
            });

            clearCart();
            // Store Order ID in local storage for "My Orders"
            const savedOrders = JSON.parse(localStorage.getItem('bar-scuola-orders') || '[]');
            savedOrders.push(order.id);
            localStorage.setItem('bar-scuola-orders', JSON.stringify(savedOrders));

            router.push(`/order/${order.id}`);
        } catch (err: any) {
            setError(err.message || 'Si è verificato un errore');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-medium text-gray-900">Il tuo carrello è vuoto</h2>
                <Button className="mt-4" onClick={() => router.push('/')}>Vai al Menu</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Il tuo ordine</h1>

            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.productId} className="p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-900">{(item.priceCents / 100).toFixed(2)}€ x {item.qty}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-200 rounded text-gray-900"
                                onClick={() => updateQty(item.productId, -1)}
                                disabled={item.qty <= 1}
                            >-</button>
                            <span className="w-8 text-center text-gray-900">{item.qty}</span>
                            <button
                                className="px-2 py-1 bg-gray-200 rounded text-gray-900"
                                onClick={() => updateQty(item.productId, 1)}
                            >+</button>
                            <button
                                className="ml-4 text-red-400 hover:text-red-700"
                                onClick={() => removeFromCart(item.productId)}
                            >Remove</button>
                        </div>
                    </Card>
                ))}

                <div className="flex justify-end pt-4 border-t">
                    <div className="text-xl font-bold text-gray-900">Totale: {(totalCents / 100).toFixed(2)}€</div>
                </div>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-medium mb-4 text-gray-900">Dettagli Studente</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome e Cognome"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Mario Rossi"
                        className="text-gray-900"
                        required
                    />
                    <Input
                        label="Classe"
                        value={studentClass}
                        onChange={e => setStudentClass(e.target.value)}
                        placeholder="5A"
                        className="text-gray-900"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Note (opzionale)</label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            rows={3}
                            maxLength={120}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                        <p className="text-xs text-gray-900 text-right">{note.length}/120</p>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

                    <Button type="submit" className="w-full text-lg py-3" isLoading={isSubmitting}>
                        ORDINA (Paga Ora)
                    </Button>
                    <p className="text-xs text-center text-gray-900">
                        Cliccando Ordina, confermi il pagamento (simulato) e l'ordine verrà inviato.
                    </p>
                </form>
            </Card>
        </div>
    );
}
