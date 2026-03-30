import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface TokenPayload {
    id: string;
    role: 'user' | 'vendor' | 'admin';
    name: string;
}

export const signToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '365d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

// Server-side auth: checks cookies first, then Authorization header
// This is used by ALL API routes
export const getAuthSession = (req?: Request): TokenPayload | null => {
    // 1. Try Authorization header (mobile app sends this)
    if (req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const payload = verifyToken(token);
            if (payload) return payload;
        }
    }

    // 2. Fall back to cookies (web browser sends this)
    try {
        const token = cookies().get('token')?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch {
        return null;
    }
};

// Client-side token decoder (does NOT verify signature — just reads payload)
// Used by Navbar and other client components to show the right UI
export function decodeTokenPayload(token: string): TokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        if (payload.id && payload.role && payload.name) {
            return { id: payload.id, role: payload.role, name: payload.name };
        }
        return null;
    } catch {
        return null;
    }
}

