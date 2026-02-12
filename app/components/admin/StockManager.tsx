'use client';

import { useState } from 'react';
import { Product } from '@prisma/client';
import { updateProductStock, toggleProductAvailability } from '@/app/actions/admin';
import { Search, Package, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StockManagerProps {
    products: Product[];
}

export default function StockManager({ products }: StockManagerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    const categories = Array.from(new Set(products.map(p => p.category)));

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleStockUpdate = async (id: string, newStock: number) => {
        try {
            await updateProductStock(id, newStock);
        } catch (error) {
            console.error('Failed to update stock', error);
            alert('Errore nell\'aggiornamento dello stock');
        }
    };

    const handleAvailabilityToggle = async (id: string, current: boolean) => {
        try {
            const formData = new FormData(); // Action expects FormData for compatibility
            await toggleProductAvailability(id, current, formData);
        } catch (error) {
            console.error('Failed to toggle availability', error);
            alert('Errore nell\'aggiornamento della disponibilità');
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cerca prodotto..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setCategoryFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === 'ALL'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        Tutti
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Prodotto</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-center">Disponibilità</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                        {(product.stock !== null && product.stock <= 5) && (
                                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Scorte in esaurimento
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <StockInput
                                                initialStock={product.stock ?? 0}
                                                onUpdate={(val) => handleStockUpdate(product.id, val)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleAvailabilityToggle(product.id, product.isAvailable)}
                                            className={`
                                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${product.isAvailable ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}
                                            `}
                                        >
                                            <span
                                                className={`
                                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                    ${product.isAvailable ? 'translate-x-6' : 'translate-x-1'}
                                                `}
                                            />
                                        </button>
                                        <div className="mt-1 text-xs text-gray-400">
                                            {product.isAvailable ? 'Attivo' : 'Nascosto'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        Nessun prodotto trovato.
                    </div>
                )}
            </div>
        </div>
    );
}

function StockInput({ initialStock, onUpdate }: { initialStock: number, onUpdate: (val: number) => void }) {
    const [value, setValue] = useState(initialStock.toString());
    const [isEditing, setIsEditing] = useState(false);

    // Sync with external updates if not editing
    if (initialStock.toString() !== value && !isEditing) {
        setValue(initialStock.toString());
    }

    const handleBlur = () => {
        setIsEditing(false);
        const num = parseInt(value);
        if (!isNaN(num) && num >= 0) {
            onUpdate(num);
        } else {
            setValue(initialStock.toString()); // Reset to valid
        }
    };

    return (
        <input
            type="number"
            min="0"
            className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            value={value}
            onFocus={() => setIsEditing(true)}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }}
        />
    );
}
