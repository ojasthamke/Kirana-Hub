// Central API configuration for both web (Vercel) and mobile (Capacitor)
// All fetch calls should use getApiUrl() to get the correct base URL

const getBase = () => {
    // 1. Explicit environment variable override (Standard Senior Practice)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        const { origin, protocol, host } = window.location;
        // If we are in a web browser and its a regular URL
        if (protocol.startsWith('http')) {
            return origin;
        }
        // If we are in a mobile/capacitor with a custom scheme, check if we're debugging
        if (host === 'localhost') return 'http://localhost:3000';
    }
    // Fallback for production (Vercel)
    return 'https://kiranahub.vercel.app';
};

const API_BASE = getBase();

export function getApiUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
}

// Helper for authenticated fetch calls (sends token from localStorage)
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = getApiUrl(path);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });
}
