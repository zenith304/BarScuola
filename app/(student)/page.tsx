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
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menu Bar</h1>
        <p className="text-gray-500">
          Ordina dalle {settings?.orderStartTime} alle {settings?.orderEndTime}
        </p>
      </header>

      {categories.map((cat) => (
        <section key={cat} id={cat} className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu[cat].map((product: Product) => (
              <Card key={product.id} className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <span className="font-bold text-blue-600">
                      {(product.priceCents / 100).toFixed(2)}€
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  )}
                  {product.allergens && (
                    <p className="text-xs text-amber-600 mt-2">Allergeni: {product.allergens}</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <AddToCartButton product={product} />
                </div>
              </Card>
            ))}
            {menu[cat].length === 0 && <p className="text-gray-400 italic">Nessun prodotto disponibile.</p>}
          </div>
        </section>
      ))}
      <FloatingCartButton />
    </div>
  );
}
