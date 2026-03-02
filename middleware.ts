import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'bar_admin_session_v1';
const SECRET_KEY = process.env.SESSION_SECRET || 'fallback_secret_must_change_in_prod_!@$1234';
const secretKey = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        if (path === '/admin/login') {
            return NextResponse.next(); // Login page is always accessible
        }

        const adminSession = request.cookies.get(SESSION_COOKIE)?.value;
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await jwtVerify(adminSession, secretKey);
        } catch (e) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
