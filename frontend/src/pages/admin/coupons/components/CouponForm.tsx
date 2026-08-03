import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-white border-slate-200/80 shadow-none rounded-lg overflow-hidden font-sans">
      <CardHeader className="p-4 sm:p-5 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Mã Giảm Giá
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
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
            className="uppercase font-mono text-xs bg-white border-slate-200 h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">
            Hình Thức Chiết Khấu <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.discount_type}
            onValueChange={(val: 'PERCENT' | 'FIXED') => setFormData((prev) => ({ ...prev, discount_type: val }))}
          >
            <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
              <SelectValue placeholder="Chọn hình thức..." />
            </SelectTrigger>
            <SelectContent className="font-sans">
              <SelectItem value="FIXED" className="text-xs">Số tiền cố định (VND)</SelectItem>
              <SelectItem value="PERCENT" className="text-xs">Phần trăm (%) giảm giá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
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
            className="font-mono text-xs bg-white border-slate-200 h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valid_from" className="text-xs font-medium text-slate-700">
            Thời Gian Bắt Đầu Hiệu Lực <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valid_from"
            name="valid_from"
            type="datetime-local"
            value={formData.valid_from}
            onChange={(e) => setFormData((prev) => ({ ...prev, valid_from: e.target.value }))}
            required
            className="font-mono text-xs bg-white border-slate-200 h-9"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="valid_until" className="text-xs font-medium text-slate-700">
            Thời Gian Hết Hạn Hiệu Lực <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valid_until"
            name="valid_until"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData((prev) => ({ ...prev, valid_until: e.target.value }))}
            required
            className="font-mono text-xs bg-white border-slate-200 h-9"
          />
        </div>
      </CardContent>
    </Card>
  );
};
