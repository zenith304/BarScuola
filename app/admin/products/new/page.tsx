'use client';

import { createProduct } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const router = useRouter();

    async function clientAction(formData: FormData) {
        await createProduct({
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            priceCents: formData.get('price') as string,
            description: formData.get('description') as string,
            allergens: formData.get('allergens') as string,
            isAvailable: formData.get('isAvailable') as string,
        });
        router.push('/admin/products');
    }

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Nuovo Prodotto</h1>
            <Card className="p-6">
                <form action={clientAction} className="space-y-4">
                    <Input name="name" label="Nome" required />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select name="category" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                            <option value="Panini">Panini</option>
                            <option value="Menu">Menu</option>
                            <option value="Bevande">Bevande</option>
                            <option value="Extra">Extra</option>
                        </select>
                    </div>

                    <Input name="price" type="number" label="Prezzo (in CENTESIMI, es. 350 per 3.50€)" required />

                    <Input name="description" label="Descrizione" />
                    <Input name="allergens" label="Allergeni" />

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isAvailable" id="avail" defaultChecked />
                        <label htmlFor="avail" className="text-sm font-medium">Disponibile subito</label>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Annulla</Button>
                        <Button type="submit">Crea Prodotto</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
