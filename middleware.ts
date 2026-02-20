import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- Admin Route Protection ---
    if (path.startsWith('/admin')) {
        const adminSession = request.cookies.get('bar_admin_session_v2')?.value;
        const isLoggedIn = !!adminSession;

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
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
