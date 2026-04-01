// Central API configuration for both web (Vercel) and mobile (Capacitor)
// All fetch calls should use getApiUrl() to get the correct base URL

const getBase = () => {
    // 1. Explicit environment variable override
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        // 2. LocalStorage override for on-the-fly mobile debugging (Pro Level)
        const manualOverride = localStorage.getItem('API_URL_OVERRIDE');
        if (manualOverride) return manualOverride;

        const { origin, protocol, host } = window.location;
        if (protocol.startsWith('http')) return origin;
        
        // 3. Smart Android/iOS Emulator Fallback
        if (host === 'localhost') return 'http://10.0.2.2:3000'; // Common Android host bridge
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
