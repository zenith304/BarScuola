'use client';

import { useEffect, useState } from 'react';
import { getOrdersByIds } from '@/app/actions/shop';
import { Button } from '@/app/components/ui/Button';
import { OrderCard } from '@/app/components/OrderCard';
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

    const handleDelete = async (orderId: string) => {
        try {
            const { deleteOrder } = await import('@/app/actions/shop');
            await deleteOrder(orderId);

            // Update LocalStorage
            const saved = localStorage.getItem('bar-scuola-orders');
            if (saved) {
                const ids = JSON.parse(saved);
                const newIds = ids.filter((id: string) => id !== orderId);
                localStorage.setItem('bar-scuola-orders', JSON.stringify(newIds));
            }

            // Update UI
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (e) {
            console.error('Delete failed:', e);
            alert('Errore nell\'eliminare l\'ordine');
        }
    };

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
                <OrderCard key={order.id} order={order} onDelete={handleDelete} />
            ))}
        </div>
    );
}
