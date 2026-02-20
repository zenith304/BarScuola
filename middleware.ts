import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        if (path === '/admin/login') {
            return NextResponse.next(); // Login page is always accessible
        }

        const adminSession = request.cookies.get('bar_admin_session_v1')?.value;
        if (adminSession !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
};
