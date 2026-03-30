'use client';
import { Package } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* Animated Logo Container */}
            <div style={{
                textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
            }}>
                <img src="/logo.png" alt="KiranaHub" style={{ height: 120, width: 'auto', objectFit: 'contain', animation: 'bounce 1.5s infinite ease-in-out' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: 8, height: 8, background: '#16a34a', borderRadius: '4',
                            animation: `loaderDots 1.5s infinite ${i * 0.2}s`,
                            opacity: 0.3
                        }} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 10px 40px -10px rgba(22, 163, 74, 0.2); } 50% { transform: scale(1.05); box-shadow: 0 15px 50px -5px rgba(22, 163, 74, 0.3); } }
                @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
                @keyframes moveUp { 0% { transform: translateY(10px) scale(0.5); opacity: 0; } 50% { opacity: 0.4; } 100% { transform: translateY(-20px) scale(1.2); opacity: 0; } }
                @keyframes loaderDots { 0%, 100% { transform: scale(0.8); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 1; } }
            `}</style>
        </div>
    );
}
