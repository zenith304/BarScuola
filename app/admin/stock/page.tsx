import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllProducts } from '@/app/actions/admin';
import StockManager from '@/app/components/admin/StockManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function StockPage() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) redirect('/admin/login');

    const products = await getAllProducts();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestione Scorte</h1>
                            <p className="text-gray-500 dark:text-gray-400">Modifica rapidamene disponibilità e quantità</p>
                        </div>
                    </div>
                </header>

                <StockManager products={products} />
            </div>
        </div>
    );
}
