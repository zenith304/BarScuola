import { getOrdersByIds } from '@/app/actions/shop';
import { Button } from '@/app/components/ui/Button';
import { OrderCard } from '@/app/components/OrderCard';
import Link from 'next/link';
import { getStudentOrdersFromCookie } from '@/lib/guest';

export default async function MyOrdersPage() {
    const studentOrderIds = await getStudentOrdersFromCookie();

    let orders: any[] = [];
    if (studentOrderIds.length > 0) {
        orders = await getOrdersByIds(studentOrderIds);
    }

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
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    );
}
