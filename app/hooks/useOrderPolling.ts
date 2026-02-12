'use client';

import { useState, useEffect } from 'react';
import { getOrderStatus } from '@/app/actions/shop';

export function useOrderPolling(orderId: string, initialStatus: string) {
    const [status, setStatus] = useState(initialStatus);

    useEffect(() => {
        // Stop polling if order is finalized (DELIVERED or CANCELLED)
        if (['DELIVERED', 'CANCELLED'].includes(status)) return;

        const intervalId = setInterval(async () => {
            try {
                const newStatus = await getOrderStatus(orderId);
                if (newStatus && newStatus !== status) {
                    setStatus(newStatus);

                    // Simple notification if status becomes READY
                    if (newStatus === 'READY' && status !== 'READY') {
                        // We could add a toast or sound here
                        if ('vibrate' in navigator) navigator.vibrate(200);
                    }
                }
            } catch (error) {
                console.error('Polling failed', error);
            }
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(intervalId);
    }, [orderId, status]);

    return status;
}
