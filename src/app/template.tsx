'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-wrapper">
      <style>{`
        body { overflow-x: hidden; }
        .page-transition-wrapper {
          animation: slideEnters 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes slideEnters {
          0% {
            opacity: 0.2;
            transform: translateX(100vw);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      {children}
    </div>
  );
}
