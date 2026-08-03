import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface AdminFormLayoutProps {
  title: string;
  description?: string;
  backPath: string;
  mode: 'create' | 'edit';
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
  submitText,
  loading = false,
  onSaveDraft,
  onSubmit,
  children,
}) => {
  const navigate = useNavigate();

  const defaultSubmitText = mode === 'create' ? 'Create Record' : 'Save Changes';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(backPath)}
          className="text-xs text-slate-600 hover:text-slate-900 bg-white border-slate-200 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to List
        </Button>
        <span className="text-xs text-slate-400 font-mono">
          MODE: <span className="font-semibold text-blue-600 uppercase">{mode}</span>
        </span>
      </div>

      {/* Main Card */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-slate-500 mt-1">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="p-6 space-y-6">
            {children}
          </CardContent>

          <Separator className="bg-slate-100" />

          {/* Sticky Action Footer */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-xs p-4 px-6 border-t border-slate-200 flex items-center justify-between shadow-xs">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backPath)}
              disabled={loading}
              className="text-xs font-medium text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveDraft}
                  disabled={loading}
                  className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Draft
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="text-xs font-semibold bg-[#0065eb] hover:bg-blue-700 text-white shadow-xs px-5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
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
