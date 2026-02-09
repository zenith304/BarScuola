'use client';

import { updateAllOrderStatuses } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function BulkActionButtons() {
    const [isLoadingPaidToReady, setIsLoadingPaidToReady] = useState(false);
    const [isLoadingReadyToDelivered, setIsLoadingReadyToDelivered] = useState(false);

    const handlePaidToReady = async () => {
        if (confirm('Confermi di voler segnare tutti gli ordini PAGATI come PRONTI?')) {
            setIsLoadingPaidToReady(true);
            try {
                await updateAllOrderStatuses('READY', 'PAID');
            } catch (error) {
                console.error(error);
                alert('Errore durante l\'operazione');
            } finally {
                setIsLoadingPaidToReady(false);
            }
        }
    };

    const handleReadyToDelivered = async () => {
        if (confirm('Confermi di voler segnare tutti gli ordini PRONTI come CONSEGNATI?')) {
            setIsLoadingReadyToDelivered(true);
            try {
                await updateAllOrderStatuses('DELIVERED', 'READY');
            } catch (error) {
                console.error(error);
                alert('Errore durante l\'operazione');
            } finally {
                setIsLoadingReadyToDelivered(false);
            }
        }
    };

    return (
        <div className="flex space-x-2">
            <Button
                variant="secondary"
                onClick={handlePaidToReady}
                isLoading={isLoadingPaidToReady}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                size="sm"
            >
                Tutti PAGATI → PRONTI
            </Button>
            <Button
                variant="secondary"
                onClick={handleReadyToDelivered}
                isLoading={isLoadingReadyToDelivered}
                className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
                size="sm"
            >
                Tutti PRONTI → CONSEGNATI
            </Button>
        </div>
    );
}
