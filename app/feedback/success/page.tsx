import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';

export default function FeedbackSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Grazie per il tuo feedback!</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Il tuo messaggio è stato inviato correttamente. Apprezziamo il tuo aiuto per migliorare il servizio.
            </p>
            <Link href="/">
                <Button>Torna al Menu</Button>
            </Link>
        </div>
    );
}
