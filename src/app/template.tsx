'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-wrapper">
      <style>{`
        body { overflow-x: hidden; }
        .page-transition-wrapper {
          animation: slideEnters 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideEnters {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: none; /* 🔴 CRITICAL: Setting to none frees position: fixed / sticky children from the stacking context */
          }
        }
      `}</style>
      {children}
    </div>
  );
}
