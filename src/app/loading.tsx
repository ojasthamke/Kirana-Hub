'use client';
import { Package } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: '#ffffff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 12, height: 12, background: '#16a34a', borderRadius: '50%', animation: `loaderPulse 1.2s infinite ${i * 0.2}s ease-in-out`, opacity: 0.2 }} />
                ))}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes loaderPulse { 0%, 100% { transform: scale(0.8); opacity: 0.2; } 50% { transform: scale(1.2); opacity: 1; } }
            `}</style>
        </div>
    );
}
