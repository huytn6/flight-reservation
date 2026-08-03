import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  title = 'Bạn có chắc chắn muốn xóa không?',
  description = 'Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn dữ liệu đã chọn khỏi hệ thống.',
  onConfirm,
  loading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-slate-200 shadow-lg rounded-xl max-w-md font-sans">
        <AlertDialogHeader>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
            <Trash2 className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base font-bold text-slate-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex items-center gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="text-xs font-medium text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
          >
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border-0 shadow-xs cursor-pointer"
          >
            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
