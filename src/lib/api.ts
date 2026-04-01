// Central API configuration for both web (Vercel) and mobile (Capacitor)
// All fetch calls should use getApiUrl() to get the correct base URL

const getBase = () => {
    // 1. Explicit environment variable override
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        const manualOverride = localStorage.getItem('API_URL_OVERRIDE');
        if (manualOverride) return manualOverride;

        const { origin, protocol, hostname } = window.location;

        // A. Handle standard web browsing
        if (protocol.startsWith('http')) {
            return origin;
        }

        // B. Handle Mobile/Capacitor Environments
        // If on emulator/localhost within app:
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://10.0.2.2:3000'; // Android emulator bridge
        }
    }
    // C. Production Fallback
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
