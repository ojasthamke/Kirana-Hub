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
                width: '80px',
                height: '80px',
                background: '#f0fdf4',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px -10px rgba(22, 163, 74, 0.2)',
                position: 'relative',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                <Package size={40} color="#16a34a" style={{ animation: 'bounce 1s infinite alternate' }} />
                
                {/* Floating particles/dots */}
                <span className="dot" style={{ position: 'absolute', top: -5, left: -5, width: 6, height: 6, background: '#16a34a', borderRadius: '50%', opacity: 0.1, animation: 'moveUp 3s infinite' }}></span>
                <span className="dot" style={{ position: 'absolute', bottom: -10, right: 10, width: 4, height: 4, background: '#16a34a', borderRadius: '50%', opacity: 0.1, animation: 'moveUp 4s infinite 1s' }}></span>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>KiranaHub</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: 6, height: 6, background: '#16a34a', borderRadius: '50%',
                            animation: `loaderDots 1s infinite ${i * 0.1}s`,
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
