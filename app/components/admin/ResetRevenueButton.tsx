'use client';

import { resetLifetimeRevenue } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function ResetRevenueButton() {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (confirm('Sei sicuro di voler azzerare l\'incasso totale? Questa azione non è reversibile.')) {
            setIsResetting(true);
            try {
                await resetLifetimeRevenue();
                alert('Incasso azzerato con successo');
            } catch (err) {
                console.error(err);
                alert('Errore durante l\'azzeramento dell\'incasso');
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
            Azzera Incasso Totale
        </Button>
    );
}
