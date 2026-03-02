import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// --- Admin Session ---
const SESSION_COOKIE = 'bar_admin_session_v1';
const SECRET_KEY = process.env.SESSION_SECRET || 'fallback_secret_must_change_in_prod_!@$1234';
const secretKey = new TextEncoder().encode(SECRET_KEY);

export async function createAdminSession() {
    const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(secretKey);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
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
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) return false;

    try {
        await jwtVerify(token, secretKey);
        return true;
    } catch (e) {
        return false;
    }
}
