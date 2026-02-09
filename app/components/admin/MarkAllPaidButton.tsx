'use client';

import { updateAllOrderStatuses } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function MarkAllReadyButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (confirm('Sei sicuro di voler segnare TUTTI gli ordini (non consegnati/cancellati) come PRONTI?')) {
            setIsLoading(true);
            try {
                await updateAllOrderStatuses('READY');
                // Optional: Toast or alert
            } catch (error) {
                console.error(error);
                alert('Errore durante l\'aggiornamento.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={handleClick}
            isLoading={isLoading}
            className="bg-green-600 text-white hover:bg-green-700"
        >
            Segna Tutti PRONTI
        </Button>
    );
}
