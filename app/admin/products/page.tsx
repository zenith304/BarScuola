import { getAllProducts, deleteProduct, toggleProductAvailability } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import Link from 'next/link';
import { Product } from '@prisma/client';

export default async function AdminProductsPage() {
    const products = await getAllProducts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gestione Prodotti</h1>
                <Link href="/admin/products/new">
                    <Button>+ Nuovo Prodotto</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                    <Card key={product.id} className="p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                <span className={`px-2 py-0.5 text-xs rounded uppercase ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.isAvailable ? 'Attivo' : 'Non disp.'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <p className="font-bold mt-1 text-gray-900">{(product.priceCents / 100).toFixed(2)}€</p>
                            {product.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.description}</p>}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <form action={toggleProductAvailability.bind(null, product.id, product.isAvailable)}>
                                <Button size="sm" variant="secondary" className="text-xs">
                                    {product.isAvailable ? 'Disabilita' : 'Abilita'}
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Link href={`/admin/products/${product.id}`}>
                                    <Button size="sm" variant="secondary">Modifica</Button>
                                </Link>
                                <form action={deleteProduct.bind(null, product.id)}>
                                    <Button size="sm" variant="destructive">Elimina</Button>
                                </form>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
