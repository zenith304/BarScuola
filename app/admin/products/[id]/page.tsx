import { getProduct, updateProduct } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    async function editAction(formData: FormData) {
        'use server';
        await updateProduct(id, {
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            priceCents: formData.get('price') as string,
            description: formData.get('description') as string,
            allergens: formData.get('allergens') as string,
            isAvailable: formData.get('isAvailable') === 'on',
        });
        redirect('/admin/products');
    }

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Modifica Prodotto</h1>
            <Card className="p-6">
                <form action={editAction} className="space-y-4 text-gray-900">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                            name="name"
                            defaultValue={product.name}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                            name="category"
                            defaultValue={product.category}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="Panini">Panini</option>
                            <option value="Menu">Menu</option>
                            <option value="Bevande">Bevande</option>
                            <option value="Extra">Extra</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (in CENTESIMI)</label>
                        <input
                            name="price"
                            type="number"
                            defaultValue={product.priceCents}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                        <input
                            name="description"
                            defaultValue={product.description || ''}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergeni</label>
                        <input
                            name="allergens"
                            defaultValue={product.allergens || ''}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            id="avail"
                            defaultChecked={product.isAvailable}
                        />
                        <label htmlFor="avail" className="text-sm font-medium">Disponibile</label>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Link href="/admin/products">
                            <Button type="button" variant="secondary">Annulla</Button>
                        </Link>
                        <Button type="submit">Salva Modifiche</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
