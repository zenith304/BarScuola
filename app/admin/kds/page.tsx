import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KDSBoard from '@/app/components/admin/KDSBoard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function KDSPage() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) redirect('/admin/login');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-4">
            <header className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">KITCHEN DISPLAY</h1>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    Vista Cucina
                </div>
            </header>

            <KDSBoard />
        </div>
    );
}
