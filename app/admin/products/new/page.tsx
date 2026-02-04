'use client';

import { createProduct } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProductPage() {
    const router = useRouter();
    const [category, setCategory] = useState('Panini');
    const [options, setOptions] = useState<Array<{ name: string; choices: string; allowMulti: boolean }>>([]);

    async function clientAction(formData: FormData) {
        await createProduct({
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            topic: formData.get('topic') as string,
            priceCents: formData.get('price') as string,
            description: formData.get('description') as string,
            allergens: formData.get('allergens') as string,
            isAvailable: formData.get('isAvailable') as string,
            options: options,
        });
        router.push('/admin/products');
    }

    function addOption() {
        setOptions([...options, { name: '', choices: '', allowMulti: true }]);
    }

    function updateOption(index: number, field: 'name' | 'choices' | 'allowMulti', value: string | boolean) {
        const updated = [...options];
        updated[index] = { ...updated[index], [field]: value };
        setOptions(updated);
    }

    function removeOption(index: number) {
        setOptions(options.filter((_, i) => i !== index));
    }

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Nuovo Prodotto</h1>
            <Card className="p-6">
                <form action={clientAction} className="space-y-4 text-gray-900">
                    <Input name="name" label="Nome" required />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="Panini Semplici">Panini Semplici</option>
                            <option value="Panini Composti">Panini Composti</option>
                            <option value="Menu">Menu</option>
                            <option value="Altro">Altro</option>
                        </select>
                        {category === 'Menu' && (
                            <p className="text-xs text-blue-600 mt-1">ℹ️ Una opzione "Bevanda" sarà aggiunta automaticamente con le bevande disponibili.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Opzionale)</label>
                        <input
                            name="topic"
                            placeholder="es. Salse, Bevande, Extra"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Categorizza il prodotto per tipo (es. Salse, Bevande)</p>
                    </div>

                    <Input name="price" type="number" label="Prezzo (in CENTESIMI, es. 350 per 3.50€)" required />

                    <Input name="description" label="Descrizione" />
                    <Input name="allergens" label="Allergeni" />

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isAvailable" id="avail" defaultChecked />
                        <label htmlFor="avail" className="text-sm font-medium">Disponibile subito</label>
                    </div>

                    {/* Options Section */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Opzioni Prodotto</h3>
                            <Button type="button" size="sm" variant="secondary" onClick={addOption}>+ Aggiungi Opzione</Button>
                        </div>
                        {options.map((opt, idx) => (
                            <div key={idx} className="border rounded p-3 mb-2 bg-gray-50">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Nome (es. Salse)"
                                        value={opt.name}
                                        onChange={(e) => updateOption(idx, 'name', e.target.value)}
                                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Scelte (es. Ketchup, Maionese)"
                                        value={opt.choices}
                                        onChange={(e) => updateOption(idx, 'choices', e.target.value)}
                                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-1 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={opt.allowMulti}
                                            onChange={(e) => updateOption(idx, 'allowMulti', e.target.checked)}
                                        />
                                        Selezione multipla
                                    </label>
                                    <button type="button" onClick={() => removeOption(idx)} className="text-red-500 text-xs">Rimuovi</button>
                                </div>
                            </div>
                        ))}
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
