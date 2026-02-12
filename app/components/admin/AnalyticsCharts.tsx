'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Card } from '@/app/components/ui/Card';
import { getAnalyticsData } from '@/app/actions/admin';

export default function AnalyticsCharts() {
    const [period, setPeriod] = useState<'7d' | '30d'>('7d');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getAnalyticsData(period);
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Caricamento grafici...</div>;
    if (!data) return <div className="text-center py-10">Nessun dato disponibile</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-gray-100">Panoramica Vendite</h2>
                <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setPeriod('7d')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${period === '7d' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        7 Giorni
                    </button>
                    <button
                        onClick={() => setPeriod('30d')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${period === '30d' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        30 Giorni
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-200">Andamento Ricavi (€)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dailySales}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} unit="€" />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${(value || 0).toFixed(2)}€`, 'Ricavo']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Hourly Distribution Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-200">Picchi di Ordini per Orario</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.hourlyDistribution}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00`} />
                                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Top Products List */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Prodotti Più Venduti</h3>
                <div className="space-y-4">
                    {data.topProducts.map((product: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className={`
                                    flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-700' :
                                            index === 2 ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}
                                `}>
                                    {index + 1}
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{product.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{product.quantity} venduti</span>
                        </div>
                    ))}
                    {data.topProducts.length === 0 && <p className="text-gray-500 italic">Nessun dato sufficiente.</p>}
                </div>
            </Card>
        </div>
    );
}
