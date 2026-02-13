'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitFeedback(formData: FormData) {
    const text = formData.get('text') as string;

    if (!text || text.trim().length === 0) {
        throw new Error('Il feedback non può essere vuoto.');
    }

    try {
        await prisma.feedback.create({
            data: {
                text,
            },
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Errore nel salvare il feedback.');
    }

    revalidatePath('/admin/feedback');
    redirect('/feedback/success'); // Or handle success in UI
}

export async function getFeedback() {
    try {
        const feedback = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return feedback;
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
}

export async function deleteFeedback(id: string) {
    try {
        await prisma.feedback.delete({
            where: { id },
        });
        revalidatePath('/admin/feedback');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        throw new Error('Errore nella cancellazione del feedback.');
    }
}
