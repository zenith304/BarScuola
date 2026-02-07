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

    if (loading) return <div className="text-center py-10 text-gray-900">Caricamento...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-10 text-gray-900 ">
                <h2 className="text-xl font-medium text-gray-900">Nessun ordine recente</h2>
                <p className="text-gray-500 mb-4">I tuoi ordini appariranno qui.</p>
                <Link href="/">
                    <Button>Vai al Menu</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">I miei ordini recenti</h1>

            {orders.map((order) => (
                <Card key={order.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('it-IT')}</p>
                            <h3 className="font-bold text-lg mt-1 text-gray-900">Codice Ritiro: <span className="text-xl text-gray-900">{order.pickupCode}</span></h3>
                            {order.pickupTime && (
                                <p className="text-sm font-medium text-gray-700">Ritiro alle: <span className="font-bold">{order.pickupTime}</span></p>
                            )}
                            <p className="text-sm font-medium mt-1 text-gray-900">Stato: <span className={`
                 px-2 py-0.5 rounded text-xs uppercase
                 ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                 ${order.status === 'IN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' : ''}
                 ${order.status === 'READY' ? 'bg-blue-100 text-blue-800' : ''}
                 ${order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' : ''}
               `}>{order.status}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">{(order.totalCents / 100).toFixed(2)}€</p>
                            {order.status === 'PAID' ? (
                                <Link href={`/order/${order.id}`} className="text-sm text-blue-600 hover:underline">Dettagli</Link>
                            ) : (
                                <><button
                                    onClick={async () => {
                                        try {
                                            const { retryPayment } = await import('@/app/actions/shop');
                                            const url = await retryPayment(order.id);
                                            window.location.href = url;
                                        } catch (e) {
                                            alert('Errore nel riprovare il pagamento');
                                        }
                                    }}
                                    className="text-sm text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0"
                                >
                                    Riprova a pagare
                                </button><Button onClick={async () => {
                                    try {
                                        const { deleteOrder } = await import('@/app/actions/shop');
                                        await deleteOrder(order.id);
                                        localStorage.removeItem('bar-scuola-orders');
                                        window.location.href = '/orders';
                                    } catch (e) {
                                        alert('Errore nell\'eliminare l\'ordine');
                                    }
                                }} className="text-sm text-red-600 hover:underline">Elimina</Button></>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
