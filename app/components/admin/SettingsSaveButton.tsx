'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/Button';
import { updateSettings } from '@/app/actions/admin';

type State = { success: boolean; ts: number } | null;

async function saveSettingsAction(_prev: State, formData: FormData): Promise<State> {
    const orderStartTime = formData.get('orderStartTime') as string;
    const orderEndTime = formData.get('orderEndTime') as string;
    const pickupStartTime = formData.get('pickupStartTime') as string;
    const pickupEndTime = formData.get('pickupEndTime') as string;
    const orderingEnabled = formData.get('orderingEnabled') === 'on';

    await updateSettings(orderStartTime, orderEndTime, pickupStartTime, pickupEndTime, orderingEnabled);
    return { success: true, ts: Date.now() };
}

export function SettingsForm({ defaultValues }: {
    defaultValues: {
        orderStartTime: string;
        orderEndTime: string;
        pickupStartTime: string;
        pickupEndTime: string;
        orderingEnabled: boolean;
    }
}) {
    const [state, formAction, pending] = useActionState(saveSettingsAction, null);
    const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (state?.success) {
            if (toastRef.current) clearTimeout(toastRef.current);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Orario Ordinazioni</h3>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-900 dark:text-white">Inizio Ordini</label>
                        <input
                            name="orderStartTime"
                            type="time"
                            className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            defaultValue={defaultValues.orderStartTime}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-900 dark:text-white">Fine Ordini</label>
                        <input
                            name="orderEndTime"
                            type="time"
                            className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            defaultValue={defaultValues.orderEndTime}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Orario Ritiro</h3>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-900 dark:text-white">Inizio Ritiro</label>
                        <input
                            name="pickupStartTime"
                            type="time"
                            className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            defaultValue={defaultValues.pickupStartTime}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-900 dark:text-white">Fine Ritiro</label>
                        <input
                            name="pickupEndTime"
                            type="time"
                            className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            defaultValue={defaultValues.pickupEndTime}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                <input
                    type="checkbox"
                    name="orderingEnabled"
                    id="enabled"
                    defaultChecked={defaultValues.orderingEnabled}
                    className="h-5 w-5 text-blue-600 rounded"
                />
                <div>
                    <label htmlFor="enabled" className="font-medium text-gray-900 dark:text-white">Abilita Ordinazioni</label>
                    <p className="text-xs text-gray-500">Se disabilitato, nessuno potrà ordinare indipendentemente dall&apos;orario.</p>
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <Button type="submit" disabled={pending}>
                    {pending ? 'Salvataggio...' : 'Salva Impostazioni'}
                </Button>

                {/* Success toast */}
                {state?.success && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium animate-fade-in">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Impostazioni salvate con successo!
                    </div>
                )}
            </div>
        </form>
    );
}
