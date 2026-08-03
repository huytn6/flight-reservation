import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/admin/DateTimePicker';

export interface CouponFormData {
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  valid_from: string;
  valid_until: string;
}

interface CouponFormProps {
  formData: CouponFormData;
  setFormData: React.Dispatch<React.SetStateAction<CouponFormData>>;
  mode: 'create' | 'edit';
}

export const CouponForm: React.FC<CouponFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  return (
    <Card className="bg-white border border-slate-200/80 shadow-none rounded-lg py-0 font-sans">
      <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Mã Giảm Giá
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="code" className="text-xs font-medium text-slate-700">
            Mã Ưu Đãi (Promo Code) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="VD: SUMMER2026"
            required
            disabled={mode === 'edit'}
            className="uppercase font-mono text-xs bg-white border-slate-200 h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            Hình Thức Chiết Khấu <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.discount_type}
            onValueChange={(val: 'PERCENT' | 'FIXED') => setFormData((prev) => ({ ...prev, discount_type: val }))}
          >
            <SelectTrigger className="text-xs bg-white border-slate-200 h-8.5">
              <SelectValue placeholder="Chọn hình thức..." />
            </SelectTrigger>
            <SelectContent className="font-sans">
              <SelectItem value="FIXED" className="text-xs">Số tiền cố định (VND)</SelectItem>
              <SelectItem value="PERCENT" className="text-xs">Phần trăm (%) giảm giá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="discount_value" className="text-xs font-medium text-slate-700">
            Giá Trị Giảm <span className="text-red-500">*</span>
          </Label>
          <Input
            id="discount_value"
            name="discount_value"
            type="number"
            value={formData.discount_value}
            onChange={(e) => setFormData((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
            placeholder={formData.discount_type === 'FIXED' ? 'VD: 100000' : 'VD: 15'}
            required
            min={1}
            className="font-mono text-xs bg-white border-slate-200 h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            Thời Gian Bắt Đầu Hiệu Lực <span className="text-red-500">*</span>
          </Label>
          <DateTimePicker
            value={formData.valid_from}
            onChange={(val) => setFormData((prev) => ({ ...prev, valid_from: val }))}
            placeholder="Chọn ngày bắt đầu..."
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            Thời Gian Hết Hạn Hiệu Lực <span className="text-red-500">*</span>
          </Label>
          <DateTimePicker
            value={formData.valid_until}
            onChange={(val) => setFormData((prev) => ({ ...prev, valid_until: val }))}
            placeholder="Chọn ngày hết hạn..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
