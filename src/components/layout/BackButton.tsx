'use client';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show back button on the homepage
    if (pathname === '/') return null;

    return (
        <button
            onClick={() => router.back()}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                background: 'rgba(255,255,255,0.9)',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                position: 'fixed',
                top: 75,
                left: 12,
                zIndex: 150,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.9)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
            aria-label="Go back"
        >
            <ArrowLeft size={15} />
            Back
        </button>
    );
}
