import { getDashboardData, updateOrderStatus, getPrintJobs, markJobPrinted } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ShopOrder, OrderItem, PrintJob } from '@prisma/client';
import { DeleteAllOrdersButton } from '@/app/components/admin/DeleteAllOrdersButton';
import { BulkActionButtons } from '@/app/components/admin/BulkActionButtons';



export const dynamic = 'force-dynamic';

type DashboardOrder = ShopOrder & { items: OrderItem[] };

export default async function AdminDashboard({ searchParams }: { searchParams: { status?: string, q?: string, sort?: string } }) {
    // Await searchParams as required in Next.js 15
    const { status, q, sort } = await searchParams;

    // Fetch Orders and Revenue
    let orders: DashboardOrder[] = [];
    let dailyRevenueCents = 0;
    let lifetimeRevenueCents = 0;

    try {
        const data = await getDashboardData(status, q, sort as any);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestisci gli ordini e monitora l'attività.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <BulkActionButtons />
                    <DeleteAllOrdersButton />
                    <form action={async () => { 'use server';  /* handled by Link or form */ }}>
                        <Button variant="secondary" formAction={async () => { 'use server'; revalidatePath('/admin/dashboard') }}>
                            🔄
                        </Button>
                    </form>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-1">Incasso Odierno</div>
                        <div className="text-4xl font-extrabold tracking-tight">{(dailyRevenueCents / 100).toFixed(2)}€</div>
                        <div className="mt-4 text-xs font-medium text-blue-100 bg-white/20 inline-block px-2 py-1 rounded">
                            Oggi
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Incasso Totale</div>
                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{(lifetimeRevenueCents / 100).toFixed(2)}€</div>
                    <div className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                        Tutto il tempo
                    </div>
                </div>
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
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 overflow-x-auto">
                        {['ALL', 'PAID', 'READY', 'DELIVERED', 'CANCELLED'].map(s => (
                            <a
                                key={s}
                                href={`/admin/dashboard?status=${s}&q=${q || ''}&sort=${sort || ''}`}
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
            </div>

            {/* Sorting */}
            <div className="flex justify-end gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Ordina per:</span>
                <div className="flex gap-2">
                    <a
                        href={`/admin/dashboard?status=${status || 'ALL'}&q=${q || ''}&sort=created_desc`}
                        className={`px-3 py-1 rounded text-xs font-medium border ${(!sort || sort === 'created_desc') ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-white border-gray-100 text-gray-600'}`}
                    >
                        Più Recenti
                    </a>
                    <a
                        href={`/admin/dashboard?status=${status || 'ALL'}&q=${q || ''}&sort=created_asc`}
                        className={`px-3 py-1 rounded text-xs font-medium border ${(sort === 'created_asc') ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-white border-gray-100 text-gray-600'}`}
                    >
                        Più Vecchi
                    </a>
                    <a
                        href={`/admin/dashboard?status=${status || 'ALL'}&q=${q || ''}&sort=pickup_asc`}
                        className={`px-3 py-1 rounded text-xs font-medium border ${(sort === 'pickup_asc') ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-white border-gray-100 text-gray-600'}`}
                    >
                        Orario Ritiro
                    </a>
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
                                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })} - {order.studentName} ({order.studentClass})</div>
                                    {order.pickupTime && (
                                        <div className="text-lg font-bold text-blue-600 mt-1">
                                            Ritiro: {order.pickupTime}
                                        </div>
                                    )}
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
                                    <div key={item.id} className="flex justify-between items-center border-b last:border-0 border-gray-200 py-1 text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <span>{item.qty}x {item.nameSnapshot}</span>
                                            {item.topicSnapshot && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                    {item.topicSnapshot}
                                                </span>
                                            )}
                                            {item.selectedOptions && (
                                                <span className="text-sm font-bold text-gray-900 block mt-1">
                                                    + {item.selectedOptions}
                                                </span>
                                            )}
                                        </div>
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
                                        <Button size="sm" variant="destructive">Annulla</Button>
                                    </form>
                                )}
                            </div>
                        </Card>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-400 italic">Nessun ordine trovato con i filtri attuali.</p>
                        </div>
                    )}
                </div>

                {/* Print Queue Side Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Coda di Stampa ({printJobs.length})</h2>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {printJobs.map((job: PrintJob & { order: ShopOrder }) => (
                            <div key={job.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">#{job.order.pickupCode}</span>
                                    <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}</span>
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
        </div >
    );
}
