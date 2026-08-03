import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  children,
}) => {
  const navigate = useNavigate();
  const defaultSubmitText = mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi';

  return (
    <div className="max-w-3xl space-y-6 pb-20 font-sans">
      {/* Integrated Page Header */}
      <AdminPageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      {/* Main Form Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              {mode === 'create' ? 'Thông tin tạo mới' : 'Chỉnh sửa thông tin'}
            </CardTitle>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0065eb] border border-blue-200 uppercase">
              {mode === 'create' ? 'TẠO MỚI' : 'CHỈNH SỬA'}
            </span>
          </div>
          {description && (
            <CardDescription className="text-xs text-slate-500 mt-1">
              Vui lòng điền đầy đủ thông tin vào các trường bắt buộc bên dưới.
            </CardDescription>
          )}
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="p-6 space-y-6">
            {children}
          </CardContent>

          <Separator className="bg-slate-200/80" />

          {/* Sticky Action Footer */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-xs p-4 px-6 border-t border-slate-200/80 flex items-center justify-between shadow-xs">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backPath)}
              disabled={loading}
              className="text-xs font-medium text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer h-9 px-4 rounded-lg"
            >
              Hủy bỏ
            </Button>

            <div className="flex items-center gap-3">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveDraft}
                  disabled={loading}
                  className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer h-9 px-4 rounded-lg"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Lưu nháp
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="text-xs font-semibold bg-[#0065eb] hover:bg-blue-700 text-white shadow-xs px-5 h-9 rounded-lg cursor-pointer transition-colors"
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
      </Card>
    </div>
  );
};
