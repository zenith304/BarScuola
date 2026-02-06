'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { stripe } from "@/lib/stripe";

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
    try {
        const settings = await prisma.settings.findUnique({ where: { id: 1 } });
        if (!settings?.orderingEnabled) {
            throw new Error('Le ordinazioni sono chiuse administrativamente.');
        }

        const now = new Date();
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
        let pickupCode = '';
        let unique = false;
        let attempts = 0;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        while (!unique && attempts < 10) {
            pickupCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
            const existing = await prisma.shopOrder.findFirst({
                where: {
                    pickupCode,
                    createdAt: { gte: startOfDay },
                    status: { not: 'CANCELLED' }
                }
            });
            if (!existing) unique = true;
            attempts++;
        }

        if (!unique) throw new Error('Impossibile generare codice univoco. Riprova.');

        // 4. Create Order (Status: PENDING_PAYMENT)
        const order = await prisma.shopOrder.create({
            data: {
                studentName: input.studentName,
                studentClass: input.studentClass,
                note: input.note,
                status: 'PENDING_PAYMENT',
                pickupCode,
                totalCents,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // 5. Create Stripe Checkout Session
        const line_items = order.items.map((item: any) => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.nameSnapshot,
                    description: item.selectedOptions ? `${item.selectedOptions}` : undefined,
                },
                unit_amount: item.priceCentsSnapshot,
            },
            quantity: item.qty,
        }));

        if (!process.env.NEXT_PUBLIC_APP_URL) {
            throw new Error('NEXT_PUBLIC_APP_URL not set in environment variables');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
            metadata: {
                orderId: order.id,
            },
            client_reference_id: order.id,
        });

        if (!session.url) {
            throw new Error('Errore nella creazione del pagamento Stripe.');
        }

        return { url: session.url, orderId: order.id };
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
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
        const dateStr = now.toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' });

        let printText = `ORDINE BAR\n${dateStr}\n\nCODICE RITIRO: ${order.pickupCode}\n\n`;
        printText += `${order.studentName} (${order.studentClass})\n`;
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
                    data: { lifetimeRevenueCents: { increment: order.totalCents } }
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
