import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that don't require login
const PUBLIC_PATHS = ['/login', '/register/user', '/register/agency'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- SENIOR CORS HANDLING ---
    // Extract origin for secure CORS with credentials
    const origin = request.headers.get('origin');
    
    // Check if it's an API route
    const isApiRoute = pathname.startsWith('/api/');

    if (isApiRoute) {
        // Handle preflight (OPTIONS) requests
        if (request.method === 'OPTIONS') {
            const res = new NextResponse(null, { status: 200 });
            res.headers.set('Access-Control-Allow-Origin', origin || '*');
            res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.headers.set('Access-Control-Allow-Credentials', 'true');
            res.headers.set('Access-Control-Max-Age', '86400');
            return res;
        }
    }

    // --- STANDARD MIDDLEWARE LOGIC ---

    // Allow static files, Next internals to pass through freely
    if (
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

    // Allow public paths and API routes to proceed
    if (isApiRoute || PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        const response = NextResponse.next();
        if (isApiRoute) {
            response.headers.set('Access-Control-Allow-Origin', origin || '*');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
        return response;
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
