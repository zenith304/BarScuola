import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple edge rate-limit store (resets on cold start, good enough for edge)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;          // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60 seconds

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }
    if (entry.count >= RATE_LIMIT_MAX) return true;
    entry.count++;
    return false;
}

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- Rate Limiting ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    // --- Admin Route Protection ---
    if (path.startsWith('/admin')) {
        const adminSession = request.cookies.get('bar_admin_session_v2')?.value;
        const isLoggedIn = !!adminSession; // Token presence check (full validation happens in server actions)

        if (path === '/admin/login') {
            // Already logged in → go to dashboard
            if (isLoggedIn) {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            return NextResponse.next();
        }

        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
