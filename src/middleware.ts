import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that don't require login
const PUBLIC_PATHS = ['/login', '/register/user', '/register/agency'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow API routes, static files, Next internals to pass through freely
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/images')
    ) {
        return NextResponse.next();
    }

    // Check for auth token cookie
    const token = request.cookies.get('token')?.value;

    // Redirect logged-in users away from login/register
    if (token && PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow public pages for unauthenticated users
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    if (!token) {
        // No token → redirect to login, preserving where they wanted to go
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Apply to all routes except static assets
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
