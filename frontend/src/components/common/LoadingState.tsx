import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-slate-500 font-sans ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <p className="text-xs sm:text-sm font-semibold text-slate-600">{message}</p>
    </div>
  );
};
