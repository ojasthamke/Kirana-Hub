'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';

export default function AppListener() {
    const router = useRouter();

    useEffect(() => {
        let listener: any;
        
        const setupListener = async () => {
            // Capacitor's backButton listener intercepts the hardware back button
            listener = await App.addListener('backButton', ({ canGoBack }) => {
                if (window.location.pathname === '/' || window.location.pathname === '/login') {
                    // Only exit the app on the main root page or login
                    App.exitApp();
                } else {
                    // Otherwise rely on Next.js routing, or use native back
                    if (window.history.length <= 1) {
                        router.push('/');
                    } else {
                        router.back();
                    }
                }
            });
        };

        // Only run when in a Capacitor environment
        if (typeof window !== 'undefined') {
            setupListener();
        }

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [router]);

    return null;
}
