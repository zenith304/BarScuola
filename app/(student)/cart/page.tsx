'use client';

import { useCart } from '@/app/context/CartContext';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react';
import { createOrder, getSettings } from '@/app/actions/shop';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
    const { items, removeFromCart, updateQty, totalCents, clearCart } = useCart();
    const router = useRouter();

    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [note, setNote] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [settings, setSettings] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName || !studentClass) {
            setError('Nome e Classe sono obbligatori');
            return;
        }
        if (!pickupTime) {
            setError('Orario di ritiro obbligatorio');
            return;
        }

        // Client-side validation for pickup time
        if (settings) {
            const [pHeader, pMin] = pickupTime.split(':').map(Number);
            const pVal = pHeader * 60 + pMin;

            const [startH, startM] = settings.pickupStartTime.split(':').map(Number);
            const startVal = startH * 60 + startM;

            const [endH, endM] = settings.pickupEndTime.split(':').map(Number);
            const endVal = endH * 60 + endM;

            if (pVal < startVal || pVal > endVal) {
                setError(`Orario non valido. Scegli tra ${settings.pickupStartTime} e ${settings.pickupEndTime}`);
                return;
            }
        }

        if (items.length === 0) {
            setError('Il carrello è vuoto');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const { url, orderId } = await createOrder({
                studentName,
                studentClass,
                note,
                pickupTime,
                cart: items.map(i => ({ productId: i.productId, qty: i.qty, selectedOptions: i.selectedOptions }))
            });

            clearCart();
            // Store Order ID in local storage for "My Orders"
            const savedOrders = JSON.parse(localStorage.getItem('bar-scuola-orders') || '[]');
            savedOrders.push(orderId);
            localStorage.setItem('bar-scuola-orders', JSON.stringify(savedOrders));

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('Url di pagamento non ricevuto');
            }
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
                    <Card key={`${item.productId}-${item.selectedOptions || 'none'}`} className="p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.selectedOptions && (
                                <p className="text-xs text-gray-600 mt-1">{item.selectedOptions}</p>
                            )}
                            <p className="text-sm text-gray-900">{(item.priceCents / 100).toFixed(2)}€ x {item.qty}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-300 rounded text-gray-900"
                                onClick={() => updateQty(item.productId, -1, item.selectedOptions)}
                                disabled={item.qty <= 1}
                            >-</button>
                            <span className="w-8 text-center text-gray-900">{item.qty}</span>
                            <button
                                className="px-2 py-1 bg-gray-300 rounded text-gray-900"
                                onClick={() => updateQty(item.productId, 1, item.selectedOptions)}
                            >+</button>
                            <button
                                className="ml-4 text-red-500 hover:text-red-700"
                                onClick={() => removeFromCart(item.productId, item.selectedOptions)}
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
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Orario di Ritiro
                            {settings && <span className="text-gray-500 font-normal ml-1">({settings.pickupStartTime} - {settings.pickupEndTime})</span>}
                        </label>
                        <input
                            type="time"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={pickupTime}
                            onChange={e => setPickupTime(e.target.value)}
                            required
                        />
                    </div>

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
                    <p className="text-xs text-center text-gray-500">
                        Cliccando Ordina, confermi il pagamento e l'ordine verrà inviato.
                    </p>
                </form>
            </Card>
        </div>
    );
}
