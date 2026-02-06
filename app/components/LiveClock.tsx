'use client';
import { useState, useEffect } from 'react';

export function LiveClock() {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const update = () => setTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return <span className="opacity-0">00:00:00</span>;

    return <span className="font-mono font-bold text-xl text-gray-900">{time}</span>;
}
