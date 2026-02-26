import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface TokenPayload {
    id: string;
    role: 'user' | 'vendor' | 'admin';
    name: string;
}

export const signToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const getAuthSession = () => {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
};
