'use client';

import { resetDailyRevenue } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function ResetDailyRevenueButton() {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (confirm('Sei sicuro di voler azzerare l\'incasso giornaliero? Questa azione non è reversibile.')) {
            setIsResetting(true);
            try {
                await resetDailyRevenue();
                alert('Incasso giornaliero azzerato con successo.');
            } catch (err) {
                console.error(err);
                alert('Errore durante l\'azzeramento.');
            } finally {
                setIsResetting(false);
            }
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleReset}
            isLoading={isResetting}
            size="sm"
            type="button"
        >
            Azzera Incasso Giornaliero
        </Button>
    );
}
