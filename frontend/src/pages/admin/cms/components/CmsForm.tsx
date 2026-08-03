import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';

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
    <div className="flex flex-col gap-6 font-sans">
      {/* Card 1: Tiêu Đề & Slug */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0065eb]" />
            Tiêu Đề & Mã Đường Dẫn (Slug)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Tiêu đề trang bài viết và đường dẫn truy cập duy nhất trên website.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="key" className="text-xs font-semibold text-slate-700">
              Mã Đường Dẫn (Slug Key) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="VD: dieukhoan-sudung, chinhsach-baomat"
              required
              disabled={mode === 'edit'}
              className="font-mono text-xs bg-white border-slate-200"
            />
            <p className="text-[11px] text-slate-400">Khóa truy vấn duy nhất được sử dụng bởi Frontend.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
              Tiêu Đề Bài Viết CMS <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Điều Khoản Dịch Vụ & Thỏa Thuận Đặt Vé Bay"
              required
              className="text-xs bg-white border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Nội Dung Chi Tiết Bài Viết */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0065eb]" />
            Nội Dung Chi Tiết Trang (Markdown / HTML)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Nội dung đầy đủ hiển thị cho người dùng trên giao diện storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="body" className="text-xs font-semibold text-slate-700">
              Nội Dung Bài Viết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              name="body"
              rows={10}
              value={formData.body}
              onChange={handleChange}
              placeholder="Nhập nội dung bài viết, điều khoản hoặc thông báo chi tiết..."
              required
              className="text-xs bg-white border-slate-200 font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0065eb]" />
              <div>
                <p className="text-xs font-bold text-slate-900">Xuất Bản Bài Viết Công Khai</p>
                <p className="text-[11px] text-slate-500">Cho phép hiển thị bài viết công khai trên giao diện website khách hàng.</p>
              </div>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
