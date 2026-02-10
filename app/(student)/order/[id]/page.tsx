import { prisma } from '@/lib/prisma';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderItem } from '@prisma/client';
import { LiveClock } from '@/app/components/LiveClock';
import { InfinityBar } from '@/app/components/InfinityBar';

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
            <p className="text-muted-foreground">Il tuo ordine è stato ricevuto e pagato.</p>

            <Card className="p-8 border-2 border-primary bg-muted/50 relative overflow-hidden dark:border-primary/50">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Codice Ritiro</h2>
                <div className="text-6xl font-black text-foreground my-4 tracking-widest">{order.pickupCode}</div>
                <p className="text-sm text-muted-foreground mb-6">Mostra questo codice al banco per ritirare.</p>

                <div className="mb-4 text-foreground">
                    <LiveClock />
                </div>

                <div className="w-full max-w-md mx-auto">
                    <InfinityBar />
                </div>
            </Card>


            <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-left">
                <h3 className="font-bold text-lg mb-4 text-foreground">Riepilogo Ordine</h3>
                <p className="text-sm text-muted-foreground mb-2">Studente: <span className="font-medium text-foreground">{order.studentName} ({order.studentClass})</span></p>
                <div className="space-y-2 border-t border-border pt-4">
                    {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between text-sm text-foreground">
                            <span>{item.qty}x {item.nameSnapshot}</span>
                            <span>{(item.priceCentsSnapshot * item.qty / 100).toFixed(2)}€</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-border text-foreground">
                    <span>Totale</span>
                    <span>{(order.totalCents / 100).toFixed(2)}€</span>
                </div>
                {order.note && (
                    <div className="mt-4 pt-4 border-t border-border text-foreground">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Note</span>
                        <p className="text-sm text-foreground bg-muted p-2 rounded mt-1">{order.note}</p>
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
