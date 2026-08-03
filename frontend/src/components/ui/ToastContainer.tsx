import React from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastItem {
  id: number | string;
  msg: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const ICON = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
} as const;

const STYLE: Record<string, string> = {
  success: 'bg-emerald-600 border-emerald-500/40 shadow-emerald-900/25',
  error: 'bg-rose-600 border-rose-500/40 shadow-rose-900/25',
  warning: 'bg-amber-500 border-amber-400/40 shadow-amber-900/25',
  info: 'bg-slate-800 border-slate-600/40 shadow-slate-900/30',
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss?: (id: number | string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col-reverse gap-2.5 pointer-events-none items-center w-full max-w-[400px] px-4">
      {toasts.map((t) => {
        const Icon = ICON[t.type as keyof typeof ICON] ?? ICON.info;
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-5 py-3.5',
              'rounded-2xl border shadow-lg text-sm font-medium w-full text-white',
              'animate-[slideIn_0.22s_cubic-bezier(0.34,1.56,0.64,1)]',
              STYLE[t.type || 'info'] ?? STYLE.info,
            )}
          >
            <Icon size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
