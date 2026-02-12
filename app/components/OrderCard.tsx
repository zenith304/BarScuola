'use client';

import { useOrderPolling } from '@/app/hooks/useOrderPolling';
import { Card } from '@/app/components/ui/Card';
import Link from 'next/link';

interface OrderCardProps {
    order: any;
    onDelete: (orderId: string) => void;
}

export function OrderCard({ order, onDelete }: OrderCardProps) {
    // Poll for status updates
    const status = useOrderPolling(order.id, order.status);

    return (
        <Card className="p-4 border-l-4 border-l-blue-500 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('it-IT')}</p>
                    <h3 className="font-bold text-lg mt-1 text-foreground">
                        Codice Ritiro: <span className="text-xl text-foreground">{order.pickupCode}</span>
                    </h3>
                    {order.pickupTime && (
                        <p className="text-sm font-medium text-muted-foreground">
                            Ritiro alle: <span className="font-bold">{order.pickupTime}</span>
                        </p>
                    )}
                    <p className="text-sm font-medium mt-1 text-foreground flex items-center gap-2">
                        Stato:
                        <span className={`
                            px-2 py-0.5 rounded text-xs uppercase font-bold transition-colors duration-500
                            ${status === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                            ${status === 'IN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${status === 'READY' ? 'bg-blue-600 text-white animate-pulse' : ''}
                            ${status === 'DELIVERED' ? 'bg-gray-100 text-gray-800 line-through decoration-2' : ''}
                            ${status === 'PENDING_PAYMENT' ? 'bg-red-100 text-red-800' : ''}
                         `}>
                            {status === 'READY' ? 'PRONTO AL RITIRO!' : status}
                        </span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-foreground">{(order.totalCents / 100).toFixed(2)}€</p>

                    {['PAID', 'IN_PREPARATION', 'READY'].includes(status) && (
                        <Link href={`/order/${order.id}`} className="block mt-2 text-sm text-blue-600 hover:underline">
                            Dettagli
                        </Link>
                    )}

                    {status === 'PENDING_PAYMENT' && (
                        <button
                            onClick={async () => {
                                try {
                                    const { retryPayment } = await import('@/app/actions/shop');
                                    const url = await retryPayment(order.id);
                                    window.location.href = url;
                                } catch (e) {
                                    alert('Errore nel riprovare il pagamento');
                                }
                            }}
                            className="block mt-2 text-sm text-blue-600 hover:underline"
                        >
                            Riprova a pagare
                        </button>
                    )}

                    {['PENDING_PAYMENT', 'DELIVERED'].includes(status) && (
                        <button
                            onClick={() => onDelete(order.id)}
                            className="block mt-2 text-sm text-red-600 hover:underline ml-auto"
                        >
                            Elimina
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}
