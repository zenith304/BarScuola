'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { stripe } from "@/lib/stripe";
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';
import { z } from 'zod';
import { addStudentOrderToCookie } from '@/lib/guest';

// --- Types ---
export type CartItem = {
    productId: string;
    qty: number;
    selectedOptions?: string; // e.g., "Salse: Ketchup, Maionese"
};

export type CreateOrderInput = {
    studentName?: string;
    studentClass: string;
    note?: string;
    pickupTime?: string;
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
    // --- Security: Rate Limit ---
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimit(ip, { maxRequests: 10, windowMs: 60_000 })) {
        return { error: 'Troppe richieste. Riprova tra un minuto.' };
    }

    // --- Security: Input Validation ---
    const cartItemSchema = z.object({
        productId: z.string().uuid(),
        qty: z.number().int().min(1).max(100),
        selectedOptions: z.string().optional()
    });

    const createOrderSchema = z.object({
        studentName: z.string().max(100).optional(),
        studentClass: z.string().min(1).max(20),
        note: z.string().max(500).optional(),
        pickupTime: z.string().regex(/^\d{2}:\d{2}$/, "Orario non valido").optional(),
        cart: z.array(cartItemSchema).min(1).max(50)
    });

    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) {
        return { error: 'Dati non validi: ' + parsed.error.issues[0].message };
    }
    const validatedInput = parsed.data;

    // 1. Check Settings (Cutoff & Enabled)
    try {
        const settings = await prisma.settings.findUnique({ where: { id: 1 } });
        if (!settings?.orderingEnabled) {
            return { error: 'Le ordinazioni sono chiuse administrativamente.' };
        }

        const now = new Date();
        // Adjust for Italy time if server is UTC?
        // Assuming server time is correct or we use UTC offsets.
        // For simplicity, we trust system time for now or assume Italy.

        const [orderStartHour, orderStartMinute] = settings.orderStartTime.split(':').map(Number);
        const [orderEndHour, orderEndMinute] = settings.orderEndTime.split(':').map(Number);

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeVal = currentHour * 60 + currentMinute;
        const orderStartTimeVal = orderStartHour * 60 + orderStartMinute;
        const orderEndTimeVal = orderEndHour * 60 + orderEndMinute;

        // Check if the current time is OUTSIDE the ordering window.
        // Two cases:
        //   Normal window (start < end): e.g. 08:00 → 10:30 — block if outside that range.
        //   Overnight window (start > end): e.g. 14:30 → 10:30 — block only if in the gap (between 10:30 and 14:30).
        const isOutsideWindow = orderStartTimeVal <= orderEndTimeVal
            ? (currentTimeVal < orderStartTimeVal || currentTimeVal > orderEndTimeVal)  // same-day window
            : (currentTimeVal < orderStartTimeVal && currentTimeVal > orderEndTimeVal); // overnight window

        if (isOutsideWindow) {
            return { error: `Ordinazioni chiuse. (Orario: ${settings.orderStartTime} - ${settings.orderEndTime})` };
        }

        // Validate Pickup Time
        if (!validatedInput.pickupTime) {
            return { error: 'Orario di ritiro mancante.' };
        }

        const [pickupHour, pickupMinute] = validatedInput.pickupTime.split(':').map(Number);
        const pickupTimeVal = pickupHour * 60 + pickupMinute;

        const [pickupStartHour, pickupStartMinute] = settings.pickupStartTime.split(':').map(Number);
        const [pickupEndHour, pickupEndMinute] = settings.pickupEndTime.split(':').map(Number);

        const pickupStartTimeVal = pickupStartHour * 60 + pickupStartMinute;
        const pickupEndTimeVal = pickupEndHour * 60 + pickupEndMinute;

        if (pickupTimeVal < pickupStartTimeVal || pickupTimeVal > pickupEndTimeVal) {
            return { error: `Orario di ritiro non valido. Scegli tra ${settings.pickupStartTime} e ${settings.pickupEndTime}` };
        }

        // 2. Calculate Total & Validate Stock (optional)
        let totalCents = 0;
        const orderItemsData: { productId: string; nameSnapshot: string; priceCentsSnapshot: number; qty: number; topicSnapshot?: string | null; selectedOptions?: string | null }[] = [];

        for (const item of validatedInput.cart) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return { error: `Prodotto non trovato: ${item.productId}` };
            if (!product.isAvailable) return { error: `Prodotto non disponibile: ${product.name}` };

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

        if (!unique) return { error: 'Impossibile generare codice univoco. Riprova.' };

        // 4. Create Order (Status: PENDING_PAYMENT)
        const order = await prisma.shopOrder.create({
            data: {
                studentName: validatedInput.studentName || '',
                studentClass: validatedInput.studentClass,
                note: validatedInput.note,
                pickupTime: validatedInput.pickupTime,
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
            return { error: 'NEXT_PUBLIC_APP_URL not set in environment variables' };
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
            return { error: 'Errore nella creazione del pagamento Stripe.' };
        }

        // Store the order ID in the guest cookie
        await addStudentOrderToCookie(order.id);

        return { url: session.url, orderId: order.id };
    } catch (error: any) {
        console.error('Error in createOrder:', error);
        // Instead of throwing, return the error message
        return { error: error.message || 'Si è verificato un errore durante la creazione dell\'ordine.' };
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

export async function getOrderStatus(orderId: string) {
    const order = await prisma.shopOrder.findUnique({
        where: { id: orderId },
        select: { status: true }
    });
    return order?.status;
}

export async function getProductsByIds(ids: string[]) {
    return await prisma.product.findMany({
        where: { id: { in: ids }, isAvailable: true },
        include: { options: true }
    });
}

export async function getBestSellerProductId(): Promise<string | null> {
    const result = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 1,
        where: { productId: { not: null } },
    });
    return result[0]?.productId ?? null;
}



export async function retryPayment(orderId: string) {
    // 1. Fetch Order
    const order = await prisma.shopOrder.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) throw new Error('Ordine non trovato');
    if (order.status === 'PAID') throw new Error('Ordine già pagato');

    // 2. Create Stripe Session (Re-use logic)
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
        throw new Error('NEXT_PUBLIC_APP_URL not set');
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

    if (!session.url) throw new Error('Errore Stripe');

    return session.url;
}

import { removeStudentOrderFromCookie } from '@/lib/guest';

export async function deleteOrder(orderId: string) {
    // 1. Fetch Order to verify it exists and check status
    const order = await prisma.shopOrder.findUnique({
        where: { id: orderId }
    });

    if (!order) throw new Error('Ordine non trovato');

    // 2. Only allow deletion of unpaid orders
    if (order.status === 'PAID') {
        throw new Error('Non è possibile eliminare un ordine già pagato');
    }

    // 3. Delete the order (cascade will handle related items)
    await prisma.shopOrder.delete({
        where: { id: orderId }
    });

    // Remove from student cookie
    await removeStudentOrderFromCookie(orderId);

    revalidatePath('/orders');
    revalidatePath('/admin/dashboard');
}
