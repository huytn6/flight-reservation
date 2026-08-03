import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { queryClient } from '@/lib/react-query';
import { useAuthStore } from '@/store/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-lg text-sm font-medium w-full text-white max-w-[400px]',
              success: '!bg-emerald-600 !border-emerald-500/40 !shadow-emerald-900/25 !text-white',
              error: '!bg-rose-600 !border-rose-500/40 !shadow-rose-900/25 !text-white',
              warning: '!bg-amber-500 !border-amber-400/40 !shadow-amber-900/25 !text-white',
              info: '!bg-slate-800 !border-slate-600/40 !shadow-slate-900/30 !text-white',
            },
          }}
          icons={{
            success: <Check size={18} strokeWidth={2.5} className="shrink-0 text-white" />,
            error: <AlertCircle size={18} strokeWidth={2.5} className="shrink-0 text-white" />,
            warning: <AlertTriangle size={18} strokeWidth={2.5} className="shrink-0 text-white" />,
            info: <Info size={18} strokeWidth={2.5} className="shrink-0 text-white" />,
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};
