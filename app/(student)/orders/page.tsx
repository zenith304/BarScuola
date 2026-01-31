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

    if (loading) return <div className="text-center py-10">Caricamento...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-medium text-gray-900">Nessun ordine recente</h2>
                <p className="text-gray-900 mb-4">I tuoi ordini appariranno qui.</p>
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
                            <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString('it-IT')}</p>
                            <h3 className="font-bold text-lg mt-1 text-gray-500">Codice Ritiro: <span className="text-xl">{order.pickupCode}</span></h3>
                            <p className="text-sm font-medium mt-1 text-gray-500">Stato: <span className={`
                 px-2 py-0.5 rounded text-xs uppercase
                 ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                 ${order.status === 'IN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' : ''}
                 ${order.status === 'READY' ? 'bg-blue-100 text-blue-800' : ''}
                 ${order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' : ''}
               `}>{order.status}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-500">{(order.totalCents / 100).toFixed(2)}€</p>
                            <Link href={`/order/${order.id}`} className="text-sm text-blue-600 hover:underline">Dettagli</Link>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
