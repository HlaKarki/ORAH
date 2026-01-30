'use client';

import { useApp } from '@/context/AppContext';
import { Check, X, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          <div className="toast-icon">
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <X size={16} />}
            {toast.type === 'info' && <Info size={16} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#6B6B70] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
