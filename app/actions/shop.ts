'use server';

import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- Types ---
export type CartItem = {
    productId: string;
    qty: number;
    selectedOptions?: string; // e.g., "Salse: Ketchup, Maionese"
};

export type CreateOrderInput = {
    studentName: string;
    studentClass: string;
    note?: string;
    cart: CartItem[];
};

// --- Helpers ---
const CATEGORIES = ['Panini Semplici', 'Panini Composti', 'Menu', 'Altro'];

// --- Actions ---

export async function getMenu() {
    const products = await prisma.product.findMany({
        where: { isAvailable: true },
        orderBy: { category: 'asc' },
        include: { options: true }
    });

    // Group by category
    const menu: Record<string, any[]> = {};
    CATEGORIES.forEach(cat => menu[cat] = []);

    products.forEach((p: any) => {
        if (menu[p.category]) {
            menu[p.category].push(p);
        } else {
            // Fallback for unknown categories
            menu['Altro'] = menu['Altro'] || [];
            menu['Altro'].push(p);
        }
    });

    return menu;
}

export async function getSettings() {
    return await prisma.settings.findUnique({ where: { id: 1 } });
}

export async function createOrder(input: CreateOrderInput) {
    // 1. Check Settings (Cutoff & Enabled)
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings?.orderingEnabled) {
        throw new Error('Le ordinazioni sono chiuse administrativamente.');
    }

    const now = new Date();
    // Simple cutoff check: Input string "10:00" vs Current Time
    // We assume server time is correct (Europe/Rome).
    // Ideally use date-fns-tz but for MVP simple string compare HH:MM is ok if timezone matches
    const [cutoffHour, cutoffMinute] = settings.cutoffTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute >= cutoffMinute)) {
        throw new Error(`Ordinazioni chiuse. (Cutoff: ${settings.cutoffTime})`);
    }

    // 2. Calculate Total & Validate Stock (optional)
    let totalCents = 0;
    const orderItemsData: { productId: string; nameSnapshot: string; priceCentsSnapshot: number; qty: number; topicSnapshot?: string | null; selectedOptions?: string | null }[] = [];

    for (const item of input.cart) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Prodotto non trovato: ${item.productId}`);
        if (!product.isAvailable) throw new Error(`Prodotto non disponibile: ${product.name}`);

        totalCents += product.priceCents * item.qty;
        orderItemsData.push({
            productId: product.id,
            nameSnapshot: product.name,
            priceCentsSnapshot: product.priceCents,
            qty: item.qty,
            topicSnapshot: product.topic || null,
            selectedOptions: item.selectedOptions || null,
        });
    }

    // 3. Generate Unique Pickup Code (4 digits)
    // Retry loop to ensure uniqueness for TODAY
    let pickupCode = '';
    let unique = false;
    let attempts = 0;

    // We check uniqueness against orders created TODAY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    while (!unique && attempts < 10) {
        pickupCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
        const existing = await prisma.shopOrder.findFirst({
            where: {
                pickupCode,
                createdAt: { gte: startOfDay },
                status: { not: 'CANCELLED' } // Reuse code only if previous was cancelled? Or simple unique constraint.
            }
        });
        if (!existing) unique = true;
        attempts++;
    }

    if (!unique) throw new Error('Impossibile generare codice univoco. Riprova.');

    // 4. Create Order & PrintJob Transaction
    const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.shopOrder.create({
            data: {
                studentName: input.studentName,
                studentClass: input.studentClass,
                note: input.note,
                status: 'PAID', // Simulate payment
                pickupCode,
                totalCents,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // Create Print Payload
        const dateStr = now.toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' });
        let printText = `ORDINE BAR\n${dateStr}\n\nCODICE RITIRO: ${pickupCode}\n\n`;
        printText += `${input.studentName} (${input.studentClass})\n`;
        newOrder.items.forEach((i: { qty: number; nameSnapshot: string; topicSnapshot?: string | null; selectedOptions?: string | null }) => {
            let itemLine = `${i.qty} x ${i.nameSnapshot}`;
            if (i.topicSnapshot) {
                itemLine += ` [${i.topicSnapshot}]`;
            }
            if (i.selectedOptions) {
                itemLine += ` (${i.selectedOptions})`;
            }
            printText += `${itemLine}\n`;
        });
        if (input.note) printText += `NOTE: ${input.note}\n`;
        printText += `\nTOTALE: ${(totalCents / 100).toFixed(2)}€\n`;
        printText += `\n--------------------------------\n`;

        await tx.printJob.create({
            data: {
                orderId: newOrder.id,
                payloadText: printText,
                status: 'QUEUED'
            }
        });

        // Increment Lifetime Revenue
        await tx.settings.update({
            where: { id: 1 },
            data: {
                lifetimeRevenueCents: { increment: totalCents }
            }
        });

        return newOrder;
    });

    return order;
}

export async function getMyOrders(limit = 10) {
    // For MVP, we can't easily identify "My" orders without a session.
    // The requirement says: "I miei ordini page (list last 10)".
    // If student isn't authenticated, maybe use a cookie to store recent Order IDs?
    // We'll rely on client passing IDs or simpler: 
    // Just return nothing for now, or assume client stores a list of IDs and requests details.
    // Better: Helper to fetch orders by IDs.
    return [];
}

export async function getOrdersByIds(ids: string[]) {
    return await prisma.shopOrder.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });
}
