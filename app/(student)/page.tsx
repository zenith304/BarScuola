import { getMenu, getSettings } from '@/app/actions/shop';
import { Product } from '@prisma/client';
import { Card } from '@/app/components/ui/Card';
import { AddToCartButton } from '@/app/components/AddToCartButton'; // We need this client component
import { FloatingCartButton } from '@/app/components/FloatingCartButton';
import { QuickReorder } from '@/app/components/QuickReorder';
import { ProductGrid } from '@/app/components/ProductGrid';


// Force dynamic to ensure time/settings are always fresh
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const menu = await getMenu();
  const settings = await getSettings();
  const categories = Object.keys(menu);

  // Check if ordering is enabled globally
  if (!settings?.orderingEnabled) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600">Le ordinazioni sono chiuse.</h1>
        <p className="mt-2 text-gray-600">Torna domani!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="mb-10 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 pb-2">
          Menu Bar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Ordina il tuo Pranzo <br className="hidden sm:inline" />
          Servizio attivo dalle <span className="font-bold text-slate-800 dark:text-slate-500">{settings?.orderStartTime}</span> alle <span className="font-bold text-slate-800 dark:text-slate-500">{settings?.orderEndTime}</span>
        </p>
      </header>

      <QuickReorder />

      <ProductGrid menu={menu} />
      <FloatingCartButton />
    </div>
  );
}
