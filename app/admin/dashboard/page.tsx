import { getDashboardData, updateOrderStatus, getPrintJobs, markJobPrinted } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ShopOrder, OrderItem, PrintJob } from '@prisma/client';
import { DeleteAllOrdersButton } from '@/app/components/admin/DeleteAllOrdersButton';


type DashboardOrder = ShopOrder & { items: OrderItem[] };

export default async function AdminDashboard({ searchParams }: { searchParams: { status?: string, q?: string } }) {
    // Await searchParams as required in Next.js 15
    const { status, q } = await searchParams;

    // Fetch Orders and Revenue
    let orders: DashboardOrder[] = [];
    let dailyRevenueCents = 0;
    let lifetimeRevenueCents = 0;

    try {
        const data = await getDashboardData(status, q);
        orders = data.orders;
        dailyRevenueCents = data.dailyRevenueCents;
        lifetimeRevenueCents = data.lifetimeRevenueCents;
    } catch (e) {
        redirect('/admin/login');
    }

    // Fetch Print Jobs
    const printJobs = await getPrintJobs();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Ordini</h1>
                <div className="flex space-x-2">
                    <DeleteAllOrdersButton />
                    <form action={async () => { 'use server';  /* handled by Link or form */ }}>
                        {/* Refresh button just reloads page or revalidates */}
                        <Button variant="secondary" formAction={async () => { 'use server'; revalidatePath('/admin/dashboard') }}>
                            Refresh
                        </Button>
                    </form>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-100">
                    <div className="text-sm font-medium text-blue-600 uppercase tracking-wider">Incasso Odierno</div>
                    <div className="text-2xl font-bold text-blue-900">{(dailyRevenueCents / 100).toFixed(2)}€</div>
                </Card>
                <Card className="p-4 bg-green-50 border-green-100">
                    <div className="text-sm font-medium text-green-600 uppercase tracking-wider">Incasso Totale</div>
                    <div className="text-2xl font-bold text-green-900">{(lifetimeRevenueCents / 100).toFixed(2)}€</div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <form className="flex-1 flex gap-2">
                    <input
                        name="q"
                        placeholder="Cerca Pickup Code (es. 1234)"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500"
                        defaultValue={q}
                    />
                    <Button type="submit" size="sm">Cerca</Button>
                </form>
                <div className="flex gap-2 overflow-x-auto">
                    {['ALL', 'PAID', 'READY', 'DELIVERED', 'CANCELLED'].map(s => (
                        <a
                            key={s}
                            href={`/admin/dashboard?status=${s}`}
                            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${(status === s || (!status && s === 'ALL'))
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {s}
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Ordini ({orders.length})</h2>
                    {orders.map((order) => (
                        <Card key={order.id} className="p-6 border-l-4 border-t border-r border-b border-l-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-gray-900">
                                    <div className="text-3xl font-black">{order.pickupCode}</div>
                                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()} - {order.studentName} ({order.studentClass})</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-gray-900">{(order.totalCents / 100).toFixed(2)}€</div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        order.status === 'IN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'READY' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
                                {order.items.map((item: OrderItem) => (
                                    <div key={item.id} className="flex justify-between border-b last:border-0 border-gray-200 py-1 text-gray-900">
                                        <span>{item.qty}x {item.nameSnapshot}</span>
                                    </div>
                                ))}
                                {order.note && (
                                    <div className="mt-2 text-yellow-700 font-medium">Nota: {order.note}</div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {order.status === 'PAID' && (
                                    <form action={updateOrderStatus.bind(null, order.id, 'READY')}>
                                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Pronto</Button>
                                    </form>
                                )}
                                {order.status === 'READY' && (
                                    <form action={updateOrderStatus.bind(null, order.id, 'DELIVERED')}>
                                        <Button size="sm" className="bg-green-500 hover:bg-green-600">Consegnato</Button>
                                    </form>
                                )}
                                {['PAID', 'IN_PREPARATION', 'READY'].includes(order.status) && (
                                    <form action={updateOrderStatus.bind(null, order.id, 'CANCELLED')}>
                                        <Button size="sm" variant="danger">Annulla</Button>
                                    </form>
                                )}
                            </div>
                        </Card>
                    ))}
                    {orders.length === 0 && <p className="text-gray-900 italic">Nessun ordine trovato</p>}
                </div>

                {/* Print Queue Side Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Coda di Stampa ({printJobs.length})</h2>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {printJobs.map((job: PrintJob & { order: ShopOrder }) => (
                            <div key={job.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">#{job.order.pickupCode}</span>
                                    <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap font-mono mb-2 border border-gray-200 text-gray-900">
                                    {job.payloadText}
                                </pre>
                                <form action={markJobPrinted.bind(null, job.id)}>
                                    <Button size="sm" variant="secondary" className="w-full text-xs">Segna come Stampato</Button>
                                </form>
                            </div>
                        ))}
                        {printJobs.length === 0 && <p className="text-xs text-gray-400 text-center">Nessun job in coda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
