import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// --- Admin Session (HMAC-signed, stateless — works on Vercel serverless) ---

const SESSION_COOKIE = 'bar_admin_session_v2';
const SECRET = process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-prod';

/** Create a signed token: randomPayload.HMAC(randomPayload) */
function createSignedToken(): string {
    const payload = randomBytes(32).toString('hex');
    const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
    return `${payload}.${sig}`;
}

/** Verify a signed token without timing attacks */
function verifySignedToken(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, sig] = parts;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    try {
        return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
        return false;
    }
}

export async function createAdminSession() {
    const token = createSignedToken();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/admin',
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
    return verifySignedToken(token);
}
