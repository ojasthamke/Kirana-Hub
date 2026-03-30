export interface TokenPayload {
    id: string;
    role: 'user' | 'vendor' | 'admin';
    name: string;
}

/**
 * Client-side utility to decode JWT without verifying the signature.
 * Safe to use in browser for UI rendering only.
 */
export function decodeTokenPayload(token: string): TokenPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decode base64 ignoring URL encoding differences
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload) as TokenPayload;
    } catch (e) {
        console.error("Failed to decode token payload", e);
        return null;
    }
}
