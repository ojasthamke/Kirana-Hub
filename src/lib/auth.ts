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

export const getAuthSession = (): TokenPayload | null => {
    // ── LOCAL MODE: No login required ──────────────────────────
    // When LOCAL_MODE=true in .env.local, everyone gets admin access.
    // This ONLY applies on your local machine. On Vercel, this is never set.
    if (process.env.LOCAL_MODE === 'true') {
        return { id: '000000000000000000000000', role: 'admin', name: 'Local Admin' };
    }
    // ── PRODUCTION: Real JWT auth ───────────────────────────────
    const token = cookies().get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
};

// Used to get a vendor session when testing locally in vendor context
export const getVendorSession = (): TokenPayload | null => {
    if (process.env.LOCAL_MODE === 'true') {
        return { id: '111111111111111111111111', role: 'vendor', name: 'Local Vendor' };
    }
    const token = cookies().get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
};
