'use client';

import { submitFeedback } from '@/app/actions/feedback';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react';
import Link from 'next/link';

export default function FeedbackPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // The server action handles redirect, but we'll wrap it to catch generic errors if needed
        // Since we are using formAction directly on the form or button, standard HTML submission works too.
        // But let's use the action prop on the form.
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Invia Feedback</h1>
            <Card className="p-6">
                <form action={submitFeedback} className="space-y-4">
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrivi il problema o il suggerimento
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            required
                            rows={4}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900 dark:text-gray-100"
                        ></textarea>
                    </div>
                    <div className="pt-2 space-y-2">
                        <Button type="submit" className="w-full">
                            Invia Segnalazione
                        </Button>
                        <Link href="/" className="block">
                            <Button variant="outline" type="button" className="w-full">
                                Torna al Menu
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
}
