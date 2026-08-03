import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface CmsFormData {
  key: string;
  title: string;
  body: string;
  is_published: boolean;
}

interface CmsFormProps {
  formData: CmsFormData;
  setFormData: React.Dispatch<React.SetStateAction<CmsFormData>>;
  mode: 'create' | 'edit';
}

export const CmsForm: React.FC<CmsFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="bg-white border border-slate-200/60 shadow-none rounded-lg py-0 font-sans">
      <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Trang Bài Viết Quản Trị Nội Dung
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <Label htmlFor="key" className="text-xs font-medium text-slate-700">
              Mã Đường Dẫn Tĩnh (Slug Key) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="VD: dieukhoan-sudung"
              required
              disabled={mode === 'edit'}
              className="font-mono text-xs bg-white border-slate-200/60 shadow-none h-8.5"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs font-medium text-slate-700">
              Tiêu Đề Bài Viết <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Điều Khoản Dịch Vụ Khách Hàng"
              required
              className="text-xs bg-white border-slate-200/60 shadow-none h-8.5"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="body" className="text-xs font-medium text-slate-700">
            Nội Dung Bài Viết Chi Tiết <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="body"
            name="body"
            rows={9}
            value={formData.body}
            onChange={handleChange}
            placeholder="Nhập nội dung chi tiết của bài viết..."
            required
            className="text-xs bg-white border-slate-200/60 shadow-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs font-medium text-slate-900">Xuất Bản Công Khai</p>
            <p className="text-[11px] text-slate-500">Hiển thị bài viết trực tiếp cho người dùng xem.</p>
          </div>
          <Switch
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
          />
        </div>
      </CardContent>
    </Card>
  );
};
