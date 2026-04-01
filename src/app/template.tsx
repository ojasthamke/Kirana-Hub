'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-wrapper">
      <style>{`
        .page-transition-wrapper {
          animation: slideEnters 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes slideEnters {
          0% {
            opacity: 0;
            transform: translateX(18px);
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
