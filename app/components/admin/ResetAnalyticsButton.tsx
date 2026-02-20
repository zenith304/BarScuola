'use client';

import { resetAnalytics } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function ResetAnalyticsButton() {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (confirm('Sei sicuro di voler azzerare tutte le analitiche storiche? Questa azione non è reversibile.')) {
            setIsResetting(true);
            try {
                await resetAnalytics();
                alert('Analitiche azzerate con successo.');
            } catch (err) {
                console.error(err);
                alert('Errore durante il reset delle analitiche.');
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
            Azzera Analitiche
        </Button>
    );
}
