import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <form onSubmit={onSubmit} className="w-full flex flex-col min-h-0">
        {/* Integrated Page Header matching Reference Image Layout */}
        <AdminPageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          backPath={backPath}
          primaryAction={{
            label: loading ? 'Đang lưu...' : (submitText || defaultSubmitText),
            disabled: loading,
          }}
          secondaryActions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(backPath)}
                disabled={loading}
                className="text-xs font-normal text-slate-600 hover:bg-slate-50 border-slate-200/70 shadow-none cursor-pointer h-8.5 px-3.5 rounded-md"
              >
                Hủy bỏ
              </Button>
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveDraft}
                  disabled={loading}
                  className="text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200/80 shadow-none cursor-pointer h-8.5 px-3.5 rounded-md"
                >
                  Lưu nháp
                </Button>
              )}
            </div>
          }
        />

        {/* 2-Column Grid: 8 cols (Main Form) + 4 cols (Right Context Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mt-3">
          
          {/* Main Form Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {children}
          </div>

          {/* Right Context Panel Column */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20">
            {sidebarContent ? (
              sidebarContent
            ) : (
              <Card className="bg-white border border-slate-200/60 shadow-none rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-900">Trạng Thái Thao Tác</span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-[#0065eb] border border-blue-100">
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
      </form>
    </div>
  );
};
