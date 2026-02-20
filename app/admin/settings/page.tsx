import { getSettings } from '@/app/actions/shop';
import { Card } from '@/app/components/ui/Card';
import { ResetRevenueButton } from '@/app/components/admin/ResetRevenueButton';
import { ResetDailyRevenueButton } from '@/app/components/admin/ResetDailyRevenueButton';
import { ResetAnalyticsButton } from '@/app/components/admin/ResetAnalyticsButton';
import { ExportButton } from '@/app/components/admin/ExportButton';
import { SettingsForm } from '@/app/components/admin/SettingsSaveButton';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Impostazioni Bar</h1>
            <Card className="p-6">
                <SettingsForm defaultValues={{
                    orderStartTime: settings?.orderStartTime || '00:00',
                    orderEndTime: settings?.orderEndTime || '10:00',
                    pickupStartTime: settings?.pickupStartTime || '13:00',
                    pickupEndTime: settings?.pickupEndTime || '14:00',
                    orderingEnabled: settings?.orderingEnabled ?? true,
                }} />
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded text-sm text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                Nota: L&apos;orario del server è utilizzato per il controllo. Assicurati che il server sia configurato su Europe/Roma.
            </div>

            <Card className="p-6 border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">Manutenzione Dati</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    Queste azioni sono irreversibili. Prestare attenzione.
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <ResetDailyRevenueButton />
                        <span className="text-xs text-red-600 dark:text-red-400">Azzera solo l&apos;incasso di oggi</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <ResetAnalyticsButton />
                        <span className="text-xs text-red-600 dark:text-red-400">Cancella lo storico grafici/prodotti</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <ResetRevenueButton />
                        <span className="text-xs text-red-600 dark:text-red-400">Azzera l&apos;incasso totale storico</span>
                    </div>
                    <ExportButton />
                </div>
            </Card>
        </div>
    );
}
