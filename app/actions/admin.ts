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

    const where: { status?: string; pickupCode?: string } = {};
    if (statusFilter && statusFilter !== 'ALL') {
        where.status = statusFilter;
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

    const dailyRevenueCents = dailyOrders.reduce((sum, o) => sum + o.totalCents, 0);

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

    return await prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: { name: string; category: string; priceCents: string | number; description?: string; allergens?: string; isAvailable?: string | boolean }) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.product.create({
        data: {
            name: data.name,
            category: data.category,
            priceCents: parseInt(String(data.priceCents)),
            description: data.description,
            allergens: data.allergens,
            isAvailable: data.isAvailable === 'on' || data.isAvailable === true,
        }
    });
    revalidatePath('/admin/products');
}

export async function updateProduct(id: string, data: { name: string; category: string; priceCents: string | number; description?: string; allergens?: string; isAvailable?: string | boolean }) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category,
            priceCents: parseInt(String(data.priceCents)),
            description: data.description,
            allergens: data.allergens,
            isAvailable: data.isAvailable === 'on' || data.isAvailable === true,
        }
    });
    revalidatePath('/admin/products');
}

export async function deleteProduct(id: string, formData: FormData) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products');
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
}

// --- Settings ---
export async function updateSettings(cutoffTime: string, orderingEnabled: boolean) {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.settings.update({
        where: { id: 1 },
        data: { cutoffTime, orderingEnabled }
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
