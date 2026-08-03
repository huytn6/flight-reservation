import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdminPageHeader, type BreadcrumbItem } from './AdminPageHeader';

export interface AdminFormLayoutProps {
  title: string;
  description?: string;
  backPath: string;
  mode: 'create' | 'edit';
  breadcrumbs?: BreadcrumbItem[];
  submitText?: string;
  loading?: boolean;
  onSaveDraft?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminFormLayout: React.FC<AdminFormLayoutProps> = ({
  title,
  description,
  backPath,
  mode,
  breadcrumbs = [],
  submitText,
  loading = false,
  onSaveDraft,
  onSubmit,
  sidebarContent,
  children,
}) => {
  const navigate = useNavigate();
  const defaultSubmitText = mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi';

  return (
    <div className="w-full space-y-4 font-sans relative">
      {/* Integrated Page Header */}
      <AdminPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      <form onSubmit={onSubmit} className="w-full flex flex-col min-h-0">
        {/* 2-Column Grid: 8 cols (Main) + 4 cols (Right Context) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Main Form Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {children}
          </div>

          {/* Right Context Panel Column */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20">
            {sidebarContent ? (
              sidebarContent
            ) : (
              <Card className="bg-white border-slate-200/80 shadow-none rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-900">Trạng Thái Thao Tác</span>
                  <span className="text-[11px] font-mono font-medium text-slate-600">
                    {mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Xác thực hệ thống</span>
                  <span className="font-medium text-emerald-600">Sẵn sàng</span>
                </div>
              </Card>
            )}
          </div>

        </div>

        {/* Sticky Action Footer (Strictly contained within content area, NEVER overlapping Sidebar) */}
        <div className="sticky bottom-0 z-20 mt-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3.5 px-4 sm:px-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backPath)}
            disabled={loading}
            className="text-xs font-medium text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer h-8 px-4 rounded-md"
          >
            Hủy bỏ
          </Button>

          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <Button
                type="button"
                variant="secondary"
                onClick={onSaveDraft}
                disabled={loading}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer h-8 px-4 rounded-md"
              >
                Lưu nháp
              </Button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="text-xs font-medium bg-[#0065eb] hover:bg-blue-700 text-white px-5 h-8 rounded-md cursor-pointer transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                submitText || defaultSubmitText
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
