'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAdminSession, deleteAdminSession, isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hashPassword, verifyPassword } from '@/lib/auth';

// --- Admin Auth ---
export async function loginAdmin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
        return { error: 'Credenziali non valide' };
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
        return { error: 'Credenziali non valide' };
    }

    await createAdminSession();
    redirect('/admin/dashboard');
}

export async function logoutAdmin() {
    await deleteAdminSession();
    redirect('/admin/login');
}

// --- Dashboard ---
export type SortOption = 'created_desc' | 'created_asc' | 'pickup_asc' | 'pickup_desc';

export async function getDashboardData(statusFilter?: string, searchCode?: string, sort?: SortOption) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    const where: { status?: string | { not: string }; pickupCode?: string } = {};
    if (statusFilter && statusFilter !== 'ALL') {
        where.status = statusFilter;
    } else {
        // Default: Show everything EXCEPT pending payment orders
        where.status = { not: 'PENDING_PAYMENT' };
    }

    if (searchCode) {
        where.pickupCode = searchCode;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
    if (sort === 'pickup_asc') orderBy = { pickupTime: 'asc' }; // Note: pickupTime is string "HH:MM", works for same-day sorting usually.
    if (sort === 'pickup_desc') orderBy = { pickupTime: 'desc' };

    const [orders, settings] = await prisma.$transaction([
        prisma.shopOrder.findMany({
            where,
            orderBy,
            include: { items: true }
        }),
        prisma.settings.findUnique({ where: { id: 1 } })
    ]);

    // Calculate Daily Revenue (sum of non-cancelled orders from today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyOrders = await prisma.shopOrder.findMany({
        where: {
            createdAt: { gte: startOfDay },
            status: { not: 'CANCELLED' }
        },
        select: { totalCents: true }
    });

    const dailyRevenueCents = dailyOrders.reduce((sum: any, o: { totalCents: any; }) => sum + o.totalCents, 0);

    return {
        orders,
        dailyRevenueCents,
        lifetimeRevenueCents: settings?.lifetimeRevenueCents || 0
    };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.shopOrder.update({
        where: { id: orderId },
        data: { status: newStatus }
    });
    revalidatePath('/admin/dashboard');
}

// --- Products ---
export async function getAllProducts() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) return []; // Or throw

    return await prisma.product.findMany({ orderBy: { category: 'asc' } });
}

export async function getProduct(id: string) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    return await prisma.product.findUnique({
        where: { id },
        include: { options: true }
    });
}

export async function createProduct(data: {
    name: string;
    category: string;
    topic?: string;
    priceCents: string | number;
    description?: string;
    allergens?: string;
    isAvailable?: string | boolean;
    options?: Array<{ name: string; choices: string; allowMulti: boolean }>;
}) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    // Auto-add drinks option for Menu category
    let optionsToCreate = data.options || [];
    if (data.category === 'Menu') {
        const drinks = await prisma.product.findMany({
            where: { category: 'Bevande', isAvailable: true },
            select: { name: true }
        });
        const drinkNames = drinks.map((d: { name: any; }) => d.name).join(', ');
        if (drinkNames) {
            optionsToCreate.push({
                name: 'Bevanda',
                choices: drinkNames,
                allowMulti: false
            });
        }
    }

    await prisma.product.create({
        data: {
            name: data.name,
            category: data.category,
            topic: data.topic || null,
            priceCents: parseInt(String(data.priceCents)),
            description: data.description,
            allergens: data.allergens,
            isAvailable: data.isAvailable === 'on' || data.isAvailable === true,
            options: {
                create: optionsToCreate
            }
        }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
}

export async function updateProduct(id: string, data: {
    name: string;
    category: string;
    topic?: string;
    priceCents: string | number;
    description?: string;
    allergens?: string;
    isAvailable?: string | boolean;
    options?: Array<{ name: string; choices: string; allowMulti: boolean }>;
}) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    // Delete existing options and recreate
    await prisma.productOption.deleteMany({ where: { productId: id } });

    // Auto-add drinks option for Menu category
    let optionsToCreate = data.options || [];
    if (data.category === 'Menu') {
        const drinks = await prisma.product.findMany({
            where: { category: 'Bevande', isAvailable: true },
            select: { name: true }
        });
        const drinkNames = drinks.map((d: { name: any; }) => d.name).join(', ');
        if (drinkNames) {
            optionsToCreate.push({
                name: 'Bevanda',
                choices: drinkNames,
                allowMulti: false
            });
        }
    }

    await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category,
            topic: data.topic || null,
            priceCents: parseInt(String(data.priceCents)),
            description: data.description,
            allergens: data.allergens,
            isAvailable: data.isAvailable === 'on' || data.isAvailable === true,
            options: {
                create: optionsToCreate
            }
        }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
}

export async function deleteProduct(id: string, formData: FormData) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (e) {
        console.error('Delete product error:', e);
        // We return void or a Promise<void> as expected by form action
        // Errors could be handled via state if needed, but for now we just log
    }
}

export async function toggleProductAvailability(id: string, current: boolean, formData: FormData) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.product.update({
        where: { id },
        data: { isAvailable: !current }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
}

// --- Settings ---
export async function updateSettings(
    orderStartTime: string,
    orderEndTime: string,
    pickupStartTime: string,
    pickupEndTime: string,
    orderingEnabled: boolean
) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.settings.update({
        where: { id: 1 },
        data: {
            orderStartTime,
            orderEndTime,
            pickupStartTime,
            pickupEndTime,
            orderingEnabled
        }
    });
    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate home/menu to update time restrictions immediately
    revalidatePath('/(student)', 'layout'); // Ensure student layout is fresh
}

export async function updateAllOrderStatuses(targetStatus: string, sourceStatus?: string) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    // Filter by source status if provided
    const whereClause: any = {
        status: {
            notIn: ['DELIVERED', 'CANCELLED']
        }
    };

    if (sourceStatus) {
        whereClause.status = sourceStatus;
    } else {
        // Fallback or specific logic
        if (targetStatus === 'READY') {
            // If source not specified but target is READY, default to upgrading PAID
            whereClause.status = 'PAID';
        } else if (targetStatus === 'DELIVERED') {
            // If source not specified but target is DELIVERED, default to upgrading READY
            whereClause.status = 'READY';
        }
    }

    // Safety check
    if (whereClause.status === 'DELIVERED') return;

    // 1. Find candidates to determine revenue impact or just for auditing
    const candidates = await prisma.shopOrder.findMany({ where: whereClause });

    if (candidates.length === 0) return;

    // 2. Transaction
    await prisma.$transaction(async (tx) => {
        for (const order of candidates) {
            await tx.shopOrder.update({
                where: { id: order.id },
                data: { status: targetStatus }
            });

            // Revenue increment only if we are marking as PAID (from unpaid)
            // If we are moving PAID -> READY, revenue is stable.
            // If we are moving READY -> DELIVERED, revenue is stable.
            if (targetStatus === 'PAID' && order.status !== 'PAID') {
                await tx.settings.update({
                    where: { id: 1 },
                    data: { lifetimeRevenueCents: { increment: order.totalCents } }
                });
            }
        }
    });

    revalidatePath('/admin/dashboard');
}

// --- Print Jobs ---
export async function getPrintJobs() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    return await prisma.printJob.findMany({
        where: { status: 'QUEUED' },
        orderBy: { createdAt: 'desc' }, // Newest first
        include: { order: true }
    });
}

export async function markJobPrinted(id: string) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.printJob.update({
        where: { id },
        data: { status: 'PRINTED' }
    });
    revalidatePath('/admin/dashboard'); // Maybe dedicated print page?
}

export async function deleteAllOrders() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    // Delete in order to avoid foreign key constraints
    await prisma.$transaction([
        prisma.orderItem.deleteMany(),
        prisma.printJob.deleteMany(),
        prisma.shopOrder.deleteMany(),
    ]);

    revalidatePath('/admin/dashboard');
}

export async function deleteOrder(orderId: string) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    // Delete in order to avoid foreign key constraints
    await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId } }),
        prisma.printJob.deleteMany({ where: { orderId } }),
        prisma.shopOrder.delete({ where: { id: orderId } }),
    ]);

    revalidatePath('/admin/dashboard');
}

export async function resetLifetimeRevenue() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.settings.update({
        where: { id: 1 },
        data: { lifetimeRevenueCents: 0 }
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/settings');
}

export async function updateProductStock(id: string, stock: number) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.product.update({
        where: { id },
        data: { stock }
    });
    revalidatePath('/admin/stock');
    revalidatePath('/admin/products');
}

export async function getAnalyticsData(period: '7d' | '30d') {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (period === '7d' ? 7 : 30));

    // Get all non-cancelled orders in period
    const orders = await prisma.shopOrder.findMany({
        where: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
        },
        include: { items: true },
        orderBy: { createdAt: 'asc' }
    });

    // 1. Daily Sales
    const dailySalesMap = new Map<string, number>();
    // Initialize all dates with 0
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        dailySalesMap.set(d.toISOString().split('T')[0], 0);
    }

    orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        const current = dailySalesMap.get(date) || 0;
        dailySalesMap.set(date, current + order.totalCents / 100);
    });

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, total]) => ({
        date,
        total
    }));

    // 2. Hourly Distribution (Peak Times)
    const hourlyMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) hourlyMap.set(i, 0);

    orders.forEach(order => {
        // Adjust for timezone roughly or use UTC hour
        // For simplicity using getHours() which uses server time
        // ideally we would project to 'Europe/Rome'
        const hour = new Date(order.createdAt).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    const hourlyDistribution = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
        hour,
        count
    }));

    // 3. Top Products
    const productCountMap = new Map<string, number>();
    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.productId) {
                productCountMap.set(item.productId, (productCountMap.get(item.productId) || 0) + item.qty);
            }
        });
    });

    // Need product names
    const products = await prisma.product.findMany({
        where: { id: { in: Array.from(productCountMap.keys()) } },
        select: { id: true, name: true }
    });

    const topProducts = products.map(p => ({
        name: p.name,
        quantity: productCountMap.get(p.id) || 0
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return {
        dailySales,
        hourlyDistribution,
        topProducts
    };
}

export async function getActiveOrders() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    return await prisma.shopOrder.findMany({
        where: {
            status: { in: ['PAID', 'IN_PREPARATION'] }
        },
        orderBy: { createdAt: 'asc' }, // Oldest first for kitchen
        include: { items: true }
    });
}

export async function exportOrdersToCSV() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    const orders = await prisma.shopOrder.findMany({
        where: { status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });

    const csvRows = [
        ['ID', 'Data', 'Stato', 'Studente', 'Classe', 'Totale (€)', 'Note', 'Articoli'].join(',')
    ];

    orders.forEach(order => {
        const itemsSummary = order.items.map(i => `${i.qty}x ${i.nameSnapshot}`).join('; ');
        const row = [
            order.pickupCode,
            new Date(order.createdAt).toISOString(),
            order.status,
            `"${order.studentName}"`,
            `"${order.studentClass}"`,
            (order.totalCents / 100).toFixed(2),
            `"${order.note || ''}"`,
            `"${itemsSummary}"`
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}
