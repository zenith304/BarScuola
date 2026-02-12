'use client';

import { useEffect, useState } from 'react';
import { getOrdersByIds } from '@/app/actions/shop';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            const saved = localStorage.getItem('bar-scuola-orders');
            if (saved) {
                try {
                    const ids = JSON.parse(saved);
                    if (Array.isArray(ids) && ids.length > 0) {
                        const data = await getOrdersByIds(ids);
                        setOrders(data);
                    }
                } catch (e) {
                    console.error('Failed to load orders', e);
                }
            }
            setLoading(false);
        };
        loadOrders();
    }, []);

    if (loading) return <div className="text-center py-10 text-gray-900 dark:text-gray-100">Caricamento...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-10 text-gray-900 ">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Nessun ordine recente</h2>
                <p className="text-gray-500 mb-4">I tuoi ordini appariranno qui.</p>
                <Link href="/">
                    <Button>Vai al Menu</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">I miei ordini recenti</h1>

            {orders.map((order) => (
                <Card key={order.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('it-IT')}</p>
                            <h3 className="font-bold text-lg mt-1 text-foreground">Codice Ritiro: <span className="text-xl text-foreground">{order.pickupCode}</span></h3>
                            {order.pickupTime && (
                                <p className="text-sm font-medium text-muted-foreground">Ritiro alle: <span className="font-bold">{order.pickupTime}</span></p>
                            )}
                            <p className="text-sm font-medium mt-1 text-foreground">Stato: <span className={`
                 px-2 py-0.5 rounded text-xs uppercase
                 ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                 ${order.status === 'IN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' : ''}
                 ${order.status === 'READY' ? 'bg-blue-100 text-blue-800' : ''}
                 ${order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' : ''}
               `}>{order.status}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-foreground">{(order.totalCents / 100).toFixed(2)}€</p>
                            {['PAID', 'IN_PREPARATION', 'READY'].includes(order.status) && (
                                <Link href={`/order/${order.id}`} className="text-sm text-blue-600 hover:underline">Dettagli</Link>
                            )}

                            {order.status === 'PENDING_PAYMENT' && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const { retryPayment } = await import('@/app/actions/shop');
                                            const url = await retryPayment(order.id);
                                            window.location.href = url;
                                        } catch (e) {
                                            alert('Errore nel riprovare il pagamento');
                                        }
                                    }} className="text-sm text-blue-600 hover:underline mr-3"
                                >
                                    Riprova a pagare
                                </button>
                            )}

                            {['PENDING_PAYMENT', 'DELIVERED'].includes(order.status) && (
                                <button onClick={async () => {
                                    try {
                                        const { deleteOrder } = await import('@/app/actions/shop');
                                        await deleteOrder(order.id);

                                        // Specific removal logic
                                        const saved = localStorage.getItem('bar-scuola-orders');
                                        if (saved) {
                                            const ids = JSON.parse(saved);
                                            const newIds = ids.filter((id: string) => id !== order.id);
                                            localStorage.setItem('bar-scuola-orders', JSON.stringify(newIds));
                                        }

                                        // Update UI state directly
                                        setOrders(orders.filter(o => o.id !== order.id));
                                    } catch (e) {
                                        console.error('Delete failed:', e);
                                        if (e instanceof Error) {
                                            alert(`Errore: ${e.message}`);
                                        } else {
                                            alert('Errore nell\'eliminare l\'ordine');
                                        }
                                    }
                                }} className="text-sm text-red-600 hover:underline">Elimina Ordine</button>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
