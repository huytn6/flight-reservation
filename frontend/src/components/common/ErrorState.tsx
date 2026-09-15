import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-red-50/50 rounded-2xl border border-red-200 p-8 text-center flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-red-950 mb-1">{title}</h3>
      <p className="text-xs text-red-600 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 font-bold rounded-full px-5 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Thử lại
        </Button>
      )}
    </div>
  );
};
