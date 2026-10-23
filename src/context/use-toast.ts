'use client';

import { createContext, useContext } from 'react';

/*
 * The context and its hook, apart from `ToastProvider` so that file exports only
 * its component (React Fast Refresh keeps state only for such files).
 */

export interface ToastContextType {
  showToast: (text: string, type?: 'download' | 'success') => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
