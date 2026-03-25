'use client';

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

const bgMap = {
  success: 'var(--color-bg-card)',
  error: 'var(--color-bg-card)',
  warning: 'var(--color-bg-card)',
  info: 'var(--color-bg-card)',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up"
      style={{
        background: bgMap[toast.type],
        border: `1px solid ${colorMap[toast.type]}20`,
      }}
    >
      <Icon size={20} style={{ color: colorMap[toast.type], flexShrink: 0 }} />
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded-full hover:opacity-70 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="Kapat"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
