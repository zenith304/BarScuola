import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// --- Admin Session ---
// Simple HttpOnly cookie — secure enough for this use case.
// The password itself is bcrypt-hashed and verified server-side.
const SESSION_COOKIE = 'bar_admin_session_v1';

export async function createAdminSession() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, 'true', {
        httpOnly: true,                                 // Not readable by JS
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
        sameSite: 'lax',                                // Lax works with redirects (Strict breaks them)
        maxAge: 60 * 60 * 8,                            // 8 hours
        path: '/',
    });
}

export async function deleteAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value === 'true';
}
