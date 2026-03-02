import { cookies } from 'next/headers';

const STUDENT_ORDERS_COOKIE = 'bar_student_orders';

export async function getStudentOrdersFromCookie(): Promise<string[]> {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(STUDENT_ORDERS_COOKIE)?.value;

    if (!cookieVal) return [];

    try {
        const ids = JSON.parse(cookieVal);
        return Array.isArray(ids) ? ids : [];
    } catch {
        return [];
    }
}

export async function addStudentOrderToCookie(orderId: string) {
    const ids = await getStudentOrdersFromCookie();

    // Avoid duplicates, though unlikely with UUIDs
    if (!ids.includes(orderId)) {
        ids.push(orderId);
    }

    // Keep only the last 20 orders to prevent cookie bloat
    if (ids.length > 20) {
        ids.shift();
    }

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_ORDERS_COOKIE, JSON.stringify(ids), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 180, // 6 months
        path: '/',
    });
}

export async function removeStudentOrderFromCookie(orderId: string) {
    const ids = await getStudentOrdersFromCookie();
    const newIds = ids.filter(id => id !== orderId);

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_ORDERS_COOKIE, JSON.stringify(newIds), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 180, // 6 months
        path: '/',
    });
}
