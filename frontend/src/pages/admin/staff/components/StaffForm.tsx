import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-white border border-slate-200/80 shadow-none rounded-lg py-0 font-sans">
      <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Tài Khoản Nhân Viên
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="full_name" className="text-xs font-medium text-slate-700">
            Họ và Tên Nhân Viên <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="VD: Nguyễn Văn Anh"
            required
            className="text-xs bg-white border-slate-200 h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-slate-700">
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
            className="text-xs bg-white border-slate-200 font-mono h-8.5"
          />
        </div>

        {mode === 'create' && (
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-slate-700">
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
              className="text-xs bg-white border-slate-200 h-8.5"
            />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            Vai Trò Quyền Hạn <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.role}
            onValueChange={(val: 'STAFF' | 'ADMIN') => setFormData((prev) => ({ ...prev, role: val }))}
          >
            <SelectTrigger className="text-xs bg-white border-slate-200 h-8.5">
              <SelectValue placeholder="Chọn vai trò..." />
            </SelectTrigger>
            <SelectContent className="font-sans">
              <SelectItem value="STAFF" className="text-xs">NHÂN VIÊN (STAFF)</SelectItem>
              <SelectItem value="ADMIN" className="text-xs">QUẢN TRỊ VIÊN (ADMIN)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
