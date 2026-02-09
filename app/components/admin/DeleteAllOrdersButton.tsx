'use client';

import { deleteAllOrders } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';

export function DeleteAllOrdersButton() {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClear = async () => {
        if (confirm('Sei sicuro di voler eliminare TUTTI gli ordini? Questa azione non è reversibile.')) {
            setIsDeleting(true);
            try {
                await deleteAllOrders();
            } catch (err) {
                console.error(err);
                alert('Errore durante l\'eliminazione degli ordini');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleClear}
            isLoading={isDeleting}
            size="sm"
        >
            Elimina Tutti gli Ordini
        </Button>
    );
}
