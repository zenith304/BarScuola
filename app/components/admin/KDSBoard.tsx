'use client';

import { useState, useEffect } from 'react';
import { getActiveOrders, updateOrderStatus } from '@/app/actions/admin';
import { ShopOrder, OrderItem } from '@prisma/client';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { CheckCircle2, Clock, ChefHat } from 'lucide-react';

type KDSOrder = ShopOrder & { items: OrderItem[] };

export default function KDSBoard() {
    const [orders, setOrders] = useState<KDSOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const fetchOrders = async () => {
        try {
            const data = await getActiveOrders();
            // Sort by pickup time ascending (HH:MM string comparison works correctly)
            const sorted = [...data].sort((a, b) => {
                const ta = a.pickupTime || '';
                const tb = b.pickupTime || '';
                return ta.localeCompare(tb);
            });
            setOrders(sorted);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Failed to fetch KDS orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleAdvanceOrder = async (orderId: string, currentStatus: string) => {
        // Optimistic update
        setOrders(prev => {
            if (currentStatus === 'IN_PREPARATION') {
                return prev.filter(o => o.id !== orderId); // Remove from board
            }
            return prev.map(o => o.id === orderId ? { ...o, status: 'IN_PREPARATION' } : o);
        });

        try {
            const nextStatus = currentStatus === 'PAID' ? 'IN_PREPARATION' : 'READY';
            await updateOrderStatus(orderId, nextStatus);
            fetchOrders(); // Re-sync to be sure
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert optimism if needed, but polling will fix it shortly
            fetchOrders();
        }
    };

    if (loading) return <div className="text-center py-20 text-2xl animate-pulse">Caricamento ordini...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <ChefHat className="w-24 h-24 mb-4 opacity-20" />
                <h2 className="text-3xl font-bold">Nessun ordine attivo</h2>
                <p className="text-xl">La cucina è libera!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4 px-2">
                <span>Ultimo aggiornamento: {lastRefreshed.toLocaleTimeString()}</span>
                <span>Ordini in coda: {orders.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map((order) => {
                    return (
                        <Card
                            key={order.id}
                            className={`
                                flex flex-col h-full border-4 shadow-md overflow-hidden relative
                                ${order.status === 'IN_PREPARATION' ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-blue-500 bg-white dark:bg-slate-900'}
                            `}
                        >
                            {/* Header */}
                            <div className={`p-4 text-white flex justify-between items-center ${order.status === 'IN_PREPARATION' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                <h3 className="text-4xl font-black">#{order.pickupCode}</h3>
                                <div className="text-right">
                                    <div className="text-xs font-medium opacity-80">Ritiro</div>
                                    <div className="text-2xl font-black">{order.pickupTime || '—'}</div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-4 grow space-y-3 overflow-y-auto max-h-[300px]">
                                {order.items.map((item) => (
                                    <div key={item.id} className="border-b border-dashed border-gray-200 pb-2 last:border-0">
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">{item.qty}x</span>
                                            <div>
                                                <div className="font-bold text-lg text-gray-800 dark:text-gray-100 leading-tight">
                                                    {item.nameSnapshot}
                                                </div>
                                                {item.selectedOptions && (
                                                    <div className="text-base text-gray-600 dark:text-gray-400 font-medium">
                                                        + {item.selectedOptions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {order.note && (
                                    <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-base font-bold border border-yellow-200 mt-2">
                                        NOTE: {order.note}
                                    </div>
                                )}
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 mt-auto">
                                <Button
                                    className={`w-full h-14 text-xl font-bold uppercase tracking-wider ${order.status === 'IN_PREPARATION'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                        }`}
                                    onClick={() => handleAdvanceOrder(order.id, order.status)}
                                >
                                    {order.status === 'IN_PREPARATION' ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <CheckCircle2 className="w-8 h-8" /> PRONTO
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 justify-center">
                                            <ChefHat className="w-8 h-8" /> INIZIA
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
