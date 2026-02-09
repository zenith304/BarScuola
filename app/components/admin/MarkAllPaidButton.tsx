'use client';

import { updateAllOrderStatuses } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function MarkAllPaidButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (confirm('Sei sicuro di voler segnare TUTTI gli ordini (non consegnati/cancellati) come PAGATI?')) {
            setIsLoading(true);
            try {
                await updateAllOrderStatuses('PAID');
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
            Segna Tutti PAGATI
        </Button>
    );
}
