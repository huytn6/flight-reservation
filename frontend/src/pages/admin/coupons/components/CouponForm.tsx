import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tag, Calendar } from 'lucide-react';

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
    <div className="flex flex-col gap-6 font-sans">
      {/* Card 1: Mã Ưu Đãi & Loại Giảm Giá */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#0065eb]" />
            Mã Khuyến Mãi & Cơ Chế Giảm Giá
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Mã voucher khách hàng nhập lúc thanh toán và hình thức chiết khấu.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                Mã Ưu Đãi (Promo Code) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="VD: SUMMER2026, FLYHIGH, WELCOME50"
                required
                disabled={mode === 'edit'}
                className="uppercase tracking-wider font-mono text-xs bg-white border-slate-200"
              />
              <p className="text-[11px] text-slate-400">Mã khuyến mãi áp dụng khi khách hàng đặt vé.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Hình Thức Chiết Khấu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.discount_type}
                onValueChange={(val: 'PERCENT' | 'FIXED') => setFormData((prev) => ({ ...prev, discount_type: val }))}
              >
                <SelectTrigger className="text-xs bg-white border-slate-200">
                  <SelectValue placeholder="Chọn hình thức..." />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  <SelectItem value="FIXED" className="text-xs">Số tiền cố định (VND)</SelectItem>
                  <SelectItem value="PERCENT" className="text-xs">Phần trăm (%) giảm giá</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="discount_value" className="text-xs font-semibold text-slate-700">
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
                className="font-mono text-xs bg-white border-slate-200"
              />
              <p className="text-[11px] text-slate-400">
                {formData.discount_type === 'FIXED' ? 'Giá trị theo VNĐ (VD: 100000 = 100,000 VNĐ)' : 'Giá trị phần trăm (1 đến 100%)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Thời Gian Hiệu Lực */}
      <Card className="bg-white border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0065eb]" />
            Thời Gian Áp Dụng Khuyến Mãi
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Khoảng thời gian hiệu lực mã voucher áp dụng vào hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="valid_from" className="text-xs font-semibold text-slate-700">
              Thời Gian Bắt Đầu Hiệu Lực <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid_from"
              name="valid_from"
              type="datetime-local"
              value={formData.valid_from}
              onChange={(e) => setFormData((prev) => ({ ...prev, valid_from: e.target.value }))}
              required
              className="font-mono text-xs bg-white border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until" className="text-xs font-semibold text-slate-700">
              Thời Gian Hết Hạn Hiệu Lực <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid_until"
              name="valid_until"
              type="datetime-local"
              value={formData.valid_until}
              onChange={(e) => setFormData((prev) => ({ ...prev, valid_until: e.target.value }))}
              required
              className="font-mono text-xs bg-white border-slate-200"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
