import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function finalizeOrder(orderId: string) {
    try {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
            include: { items: true, printJob: true }
        });

        if (!order) return;

        // If not already PAID, or if PrintJob is missing, we proceed
        const needsUpdate = order.status !== 'PAID';
        const needsPrintJob = !order.printJob;

        if (!needsUpdate && !needsPrintJob) {
            // Nothing to do
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });

        let printText = `ORDINE BAR\n${dateStr}\n\n`;
        printText += `################################\n`;
        printText += `#        CODICE RITIRO         #\n`;
        printText += `#                              #\n`;
        printText += `#             ${order.pickupCode}             #\n`;
        printText += `#                              #\n`;
        printText += `################################\n\n`;

        if (order.pickupTime) {
            printText += `ORARIO RITIRO: ${order.pickupTime}\n\n`;
        } else {
            printText += `\n`;
        }
        if (order.studentName) {
            printText += `${order.studentName} (${order.studentClass})\n`;
        } else {
            printText += `${order.studentClass}\n`;
        }
        order.items.forEach((i) => {
            let itemLine = `${i.qty} x ${i.nameSnapshot}`;
            if (i.topicSnapshot) {
                itemLine += ` [${i.topicSnapshot}]`;
            }
            if (i.selectedOptions) {
                itemLine += `\n   + ${i.selectedOptions}`;
            }
            printText += `${itemLine}\n`;
        });
        if (order.note) printText += `NOTE: ${order.note}\n`;
        printText += `\nTOTALE: ${(order.totalCents / 100).toFixed(2)}€\n`;
        printText += `\n--------------------------------\n`;

        await prisma.$transaction(async (tx) => {
            if (needsUpdate) {
                await tx.shopOrder.update({
                    where: { id: orderId },
                    data: { status: 'PAID' }
                });
                // Increment revenue only when converting to PAID
                await tx.settings.update({
                    where: { id: 1 },
                    data: {
                        lifetimeRevenueCents: { increment: order.totalCents },
                        dailyRevenueCents: { increment: order.totalCents },
                    }
                });
            }

            if (needsPrintJob) {
                await tx.printJob.create({
                    data: {
                        orderId: order.id,
                        payloadText: printText,
                        status: 'QUEUED'
                    }
                });
            }
        });

        revalidatePath('/admin/dashboard');
    } catch (error) {
        console.error('Error finalizing order:', error);
        // Don't throw to avoid crashing the webhook/page, just log
    }
}
