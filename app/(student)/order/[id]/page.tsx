import { prisma } from '@/lib/prisma';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderItem } from '@prisma/client';

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
    // Use await params
    const { id } = await params;

    const order = await prisma.shopOrder.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!order) notFound();

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="bg-green-50 p-8 rounded-full inline-block mx-auto">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Ordine Confermato!</h1>
            <p className="text-gray-600">Il tuo ordine è stato ricevuto e pagato.</p>

            <Card className="p-8 border-2 border-blue-500 bg-blue-50">
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Codice Ritiro</h2>
                <div className="text-6xl font-black text-gray-900 my-4 tracking-widest">{order.pickupCode}</div>
                <p className="text-sm text-gray-500">Mostra questo codice al banco per ritirare.</p>
            </Card>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Riepilogo Ordine</h3>
                <p className="text-sm text-gray-600 mb-2">Studente: <span className="font-medium text-gray-900">{order.studentName} ({order.studentClass})</span></p>
                <div className="space-y-2 border-t pt-4">
                    {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-900">
                            <span>{item.qty}x {item.nameSnapshot}</span>
                            <span>{(item.priceCentsSnapshot * item.qty / 100).toFixed(2)}€</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t text-gray-900">
                    <span>Totale</span>
                    <span>{(order.totalCents / 100).toFixed(2)}€</span>
                </div>
                {order.note && (
                    <div className="mt-4 pt-4 border-t text-gray-900">
                        <span className="text-xs font-bold text-gray-500 uppercase">Note</span>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded mt-1">{order.note}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center space-x-4">
                <Link href="/">
                    <Button variant="secondary">Torna al Menu</Button>
                </Link>
                <Link href="/orders">
                    <Button>I Miei Ordini</Button>
                </Link>
            </div>
        </div>
    );
}
