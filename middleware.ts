import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protect /admin routes
    if (path.startsWith('/admin')) {
        // Exclude /admin/login from protection to avoid redirect loop
        if (path === '/admin/login') {
            // Optional: If already logged in, redirect to dashboard?
            // For now, just let them see the login page.
            return NextResponse.next();
        }

        const adminSession = request.cookies.get('bar_admin_session_v1')?.value;

        if (adminSession !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (if you have auth api routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
