'use client';

import { ToastContext } from './use-toast';
import React, { useState, useCallback } from 'react';
import { Download, Check } from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'download' | 'success';
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'download' | 'success' = 'download') => {
    const id = Math.random().toString();
    setToast({ id, text, type });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <>
        {toast && (
          <div className="opb-pop fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-surface-primary text-text-primary border border-border shadow-md max-w-sm pointer-events-none select-none">
            {toast.type === 'download' ? (
              <Download className="w-4 h-4 text-accent flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-accent flex-shrink-0" />
            )}
            <span className="font-body text-xs sm:text-sm font-medium tracking-wide">
              {toast.text}
            </span>
          </div>
        )}
      </>
    </ToastContext.Provider>
  );
};
