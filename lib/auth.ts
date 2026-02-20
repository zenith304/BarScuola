import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// --- Admin Session ---
// We keep a server-side Set of valid tokens so that even if an attacker
// somehow reads the cookie value, they cannot reuse it after logout.
const validSessions = new Set<string>();

export async function createAdminSession() {
    // Generate a cryptographically random token
    const token = randomBytes(32).toString('hex'); // 64-char hex string
    validSessions.add(token);

    const cookieStore = await cookies();
    cookieStore.set('bar_admin_session_v2', token, {
        httpOnly: true,                                  // Not readable by JS
        secure: process.env.NODE_ENV === 'production',   // HTTPS only in prod
        sameSite: 'strict',                              // Blocks CSRF completely
        maxAge: 60 * 60 * 8,                             // 8 hours
        path: '/admin',                                  // Scoped to /admin only
    });
}

export async function deleteAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('bar_admin_session_v2')?.value;
    if (token) {
        validSessions.delete(token); // Invalidate server-side too
    }
    cookieStore.delete('bar_admin_session_v2');
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('bar_admin_session_v2')?.value;
    if (!token) return false;
    return validSessions.has(token); // Must match a token WE issued
}
