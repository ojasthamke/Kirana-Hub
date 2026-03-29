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
        // Add CORS for API routes
        if (pathname.startsWith('/api/')) {
            const origin = request.headers.get('origin');
            const allowedOrigins = [
                'http://localhost',
                'capacitor://localhost',
                'http://localhost:3000'
            ];
            
            // Determine if the origin should be allowed
            const isAllowed = !origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
            const responseOrigin = isAllowed ? (origin || '*') : '*';

            if (request.method === 'OPTIONS') {
                const res = new NextResponse(null, { status: 204 });
                res.headers.set('Access-Control-Allow-Origin', responseOrigin);
                res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
                res.headers.set('Access-Control-Allow-Credentials', 'true');
                return res;
            }

            const response = NextResponse.next();
            response.headers.set('Access-Control-Allow-Origin', responseOrigin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            return response;
        }
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
