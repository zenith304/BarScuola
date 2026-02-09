import { getFeedback } from '@/app/actions/feedback';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
    const feedbackList = await getFeedback();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Feedback Ricevuti</h1>

            <div className="grid gap-4">
                {feedbackList.map((item) => (
                    <Card key={item.id} className="p-4 border-l-4 border-yellow-400">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>{new Date(item.createdAt).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{item.status}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{item.text}</p>
                    </Card>
                ))}

                {feedbackList.length === 0 && (
                    <p className="text-gray-500 italic">Nessun feedback presente.</p>
                )}
            </div>
        </div>
    );
}
