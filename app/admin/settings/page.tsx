import { updateSettings } from '@/app/actions/admin';
import { getSettings } from '@/app/actions/shop';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { ResetRevenueButton } from '@/app/components/admin/ResetRevenueButton';
import { ExportButton } from '@/app/components/admin/ExportButton';


export default async function SettingsPage() {
    const settings = await getSettings();

    async function saveSettings(formData: FormData) {
        'use server';
        const orderStartTime = formData.get('orderStartTime') as string;
        const orderEndTime = formData.get('orderEndTime') as string;
        const pickupStartTime = formData.get('pickupStartTime') as string;
        const pickupEndTime = formData.get('pickupEndTime') as string;
        const orderingEnabled = formData.get('orderingEnabled') === 'on';

        await updateSettings(orderStartTime, orderEndTime, pickupStartTime, pickupEndTime, orderingEnabled);
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Impostazioni Bar</h1>
            <Card className="p-6">
                <form action={saveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Orario Ordinazioni</h3>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-900 dark:text-white">Inizio Ordini</label>
                                <Input
                                    name="orderStartTime"
                                    type="time"
                                    className="text-gray-900 dark:text-white"
                                    defaultValue={settings?.orderStartTime || '00:00'}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-900 dark:text-white">Fine Ordini</label>
                                <Input
                                    name="orderEndTime"
                                    type="time"
                                    className="text-gray-900 dark:text-white"
                                    defaultValue={settings?.orderEndTime || '10:00'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Orario Ritiro</h3>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-900 dark:text-white">Inizio Ritiro</label>
                                <Input
                                    name="pickupStartTime"
                                    type="time"
                                    className="text-gray-900 dark:text-white"
                                    defaultValue={settings?.pickupStartTime || '13:00'}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-900 dark:text-white">Fine Ritiro</label>
                                <Input
                                    name="pickupEndTime"
                                    type="time"
                                    className="text-gray-900 dark:text-white"
                                    defaultValue={settings?.pickupEndTime || '14:00'}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <input
                            type="checkbox"
                            name="orderingEnabled"
                            id="enabled"
                            defaultChecked={settings?.orderingEnabled}
                            className="h-5 w-5 text-blue-600 rounded"
                        />
                        <div>
                            <label htmlFor="enabled" className="font-medium text-gray-900 dark:text-white">Abilita Ordinazioni</label>
                            <p className="text-xs text-gray-500">Se disabilitato, nessuno potrà ordinare indipendentemente dall'orario.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit">Salva Impostazioni</Button>
                    </div>
                </form>
            </Card>

            <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200">
                Nota: L'orario del server è utilizzato per il controllo. Assicurati che il server sia configurato su Europe/Roma.
            </div>

            <Card className="p-6 border-red-100 bg-red-50">
                <h3 className="text-lg font-bold text-red-900 mb-2">Manutenzione Dati</h3>
                <p className="text-sm text-red-700 mb-4">
                    Queste azioni sono irreversibili. Prestare attenzione.
                </p>
                <div className="flex flex-wrap gap-4">
                    <ResetRevenueButton />
                    <ExportButton />
                </div>
            </Card>
        </div>
    );
}
