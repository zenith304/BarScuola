import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// Simple Admin Verification (No session persistence for MVP, just check credentials on login)
// Actually, we need a session for Admin routes.
// We'll use a simple HTTP-only cookie 'admin_session' = 'true' (secure enough for MVP simulation)
// In a real app, use Jose/JWT.

import { cookies } from 'next/headers';

export async function createAdminSession() {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
}

export async function deleteAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
}

export async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === 'true';
}
