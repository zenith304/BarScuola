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
export async function getDashboardData(statusFilter?: string, searchCode?: string) {
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

    const [orders, settings] = await prisma.$transaction([
        prisma.shopOrder.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
}

// --- Print Jobs ---
export async function getPrintJobs() {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    return await prisma.printJob.findMany({
        where: { status: 'QUEUED' },
        orderBy: { createdAt: 'asc' },
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
