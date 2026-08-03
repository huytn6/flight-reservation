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
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. This will permanently delete the selected item from the system.',
  onConfirm,
  loading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-slate-200 shadow-lg rounded-xl max-w-md">
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
            className="text-xs font-medium text-slate-600 hover:bg-slate-100 border-slate-200"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border-0 shadow-xs"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
