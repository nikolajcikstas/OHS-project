import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

interface ToastItem {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="alert">
            <strong>{t.title}</strong>
            {t.message ? ` — ${t.message}` : ''}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
