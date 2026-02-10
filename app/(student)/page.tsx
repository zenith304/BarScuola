import { getMenu, getSettings } from '@/app/actions/shop';
import { Product } from '@prisma/client';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { AddToCartButton } from '@/app/components/AddToCartButton'; // We need this client component
import { FloatingCartButton } from '@/app/components/FloatingCartButton';


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
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 pb-2">
          Menu Bar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Ordina il tuo Pranzo <br className="hidden sm:inline" />
          Servizio attivo dalle <span className="font-bold text-slate-800 dark:text-slate-500">{settings?.orderStartTime}</span> alle <span className="font-bold text-slate-800 dark:text-slate-500">{settings?.orderEndTime}</span>
        </p>
      </header>

      {categories.map((cat) => (
        <section key={cat} id={cat} className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu[cat].map((product: Product) => (
              <Card key={product.id} className="p-0 flex flex-col justify-between h-full group overflow-hidden border-border hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</h3>
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-sm whitespace-nowrap">
                      {(product.priceCents / 100).toFixed(2)}€
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{product.description}</p>
                  )}
                  {product.allergens && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                      {product.allergens}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/30 border-t border-border">
                  <AddToCartButton product={product} />
                </div>
              </Card>
            ))}
            {menu[cat].length === 0 && <p className="text-muted-foreground italic">Nessun prodotto disponibile.</p>}
          </div>
        </section>
      ))}
      <FloatingCartButton />
    </div>
  );
}
