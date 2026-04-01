// Central API configuration for both web (Vercel) and mobile (Capacitor)
// All fetch calls should use getApiUrl() to get the correct base URL

const getBase = () => {
    // 1. Explicit environment variable override
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        const manualOverride = localStorage.getItem('API_URL_OVERRIDE');
        if (manualOverride) return manualOverride;

        // Strict Mobile/Capacitor App Detection
        // If we are running inside the Android APK...
        if ((window as any).Capacitor || window.location.protocol === 'capacitor:') {
            // Always hit your live server from the mobile app
            return 'https://kiranahub.vercel.app';
        }

        const { origin, protocol, hostname } = window.location;

        // Handle standard web browsing on a laptop/PC
        const isInternalMobileHost = (hostname === 'localhost' || hostname === '127.0.0.1');
        if (protocol.startsWith('http') && !isInternalMobileHost) {
            return origin;
        }
    }
    // Production Fallback
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
