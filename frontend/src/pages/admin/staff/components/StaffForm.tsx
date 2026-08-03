import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck, ShieldCheck } from 'lucide-react';

export interface StaffFormData {
  email: string;
  password?: string;
  full_name: string;
  role: 'STAFF' | 'ADMIN';
}

interface StaffFormProps {
  formData: StaffFormData;
  setFormData: React.Dispatch<React.SetStateAction<StaffFormData>>;
  mode: 'create' | 'edit';
}

export const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Card 1: Thông Tin Cá Nhân & Tài Khoản */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0065eb]" />
            Thông Tin Cá Nhân & Email Đăng Nhập
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Thông tin định danh người dùng và email công việc chính thức.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
              Họ và Tên Nhân Viên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="VD: Nguyễn Văn Anh"
              required
              className="text-xs bg-white border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email Công Việc (Tài Khoản) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="VD: anh.nguyen@company.com"
              required
              disabled={mode === 'edit'}
              className="text-xs bg-white border-slate-200 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Bảo Mật & Phân Quyền Hệ Thống */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0065eb]" />
            Bảo Mật Mật Khẩu & Cấp Quyền Vai Trò
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Khởi tạo mật khẩu ban đầu và thiết lập quyền hạn truy cập quản trị.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Mật Khẩu Ban Đầu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="••••••••"
                required={mode === 'create'}
                className="text-xs bg-white border-slate-200"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Vai Trò Quyền Hạn Trong Hệ Thống <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(val: 'STAFF' | 'ADMIN') => setFormData((prev) => ({ ...prev, role: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200">
                <SelectValue placeholder="Chọn vai trò..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                <SelectItem value="STAFF" className="text-xs">NHÂN VIÊN (Vận hành & Hỗ trợ vé)</SelectItem>
                <SelectItem value="ADMIN" className="text-xs">QUẢN TRỊ VIÊN (Toàn quyền Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
