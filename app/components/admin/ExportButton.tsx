'use client';

import { exportOrdersToCSV } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Download } from 'lucide-react';
import { useState } from 'react';

export function ExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const csvData = await exportOrdersToCSV();

            // Create a Blob and trigger download
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ordini_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed', error);
            alert('Errore durante l\'esportazione CSV');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            variant="secondary"
            className="flex items-center gap-2"
        >
            <Download className="w-4 h-4" />
            {loading ? 'Esportazione...' : 'Esporta Ordini (CSV)'}
        </Button>
    );
}
