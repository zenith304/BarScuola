import { updateSettings } from '@/app/actions/admin';
import { getSettings } from '@/app/actions/shop';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';

export default async function SettingsPage() {
    const settings = await getSettings();

    async function saveSettings(formData: FormData) {
        'use server';
        const cutoffTime = formData.get('cutoffTime') as string;
        const orderingEnabled = formData.get('orderingEnabled') === 'on';

        await updateSettings(cutoffTime, orderingEnabled);
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Impostazioni Bar</h1>
            <Card className="p-6">
                <form action={saveSettings} className="space-y-6">
                    <div className="space-y-1">
                        <label className="font-medium text-gray-900">Orario di Chiusura Ordini (Cutoff)</label>
                        <p className="text-sm text-gray-500">I ragazzi non potranno ordinare dopo questo orario.</p>
                        <Input
                            name="cutoffTime"
                            type="time"
                            className="text-gray-900"
                            defaultValue={settings?.cutoffTime || '10:00'}
                            required
                        />
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
                            <label htmlFor="enabled" className="font-medium text-gray-900">Abilita Ordinazioni</label>
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
        </div>
    );
}
