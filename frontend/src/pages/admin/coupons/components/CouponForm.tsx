import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
            Coupon Promo Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. SUMMER2026, FLYHIGH, WELCOME50"
            required
            disabled={mode === 'edit'}
            className="uppercase tracking-wider font-mono text-sm bg-white border-slate-200"
          />
          <p className="text-[11px] text-slate-400">Promotional promo code customers enter at checkout.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Discount Mechanism <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.discount_type}
            onValueChange={(val: 'PERCENT' | 'FIXED') => setFormData((prev) => ({ ...prev, discount_type: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">FIXED (Fixed Amount in VND)</SelectItem>
              <SelectItem value="PERCENT">PERCENT (Percentage % Off)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="discount_value" className="text-xs font-semibold text-slate-700">
            Discount Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id="discount_value"
            name="discount_value"
            type="number"
            value={formData.discount_value}
            onChange={(e) => setFormData((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
            placeholder={formData.discount_type === 'FIXED' ? 'e.g. 100000' : 'e.g. 15'}
            required
            min={1}
            className="font-mono text-sm bg-white border-slate-200"
          />
          <p className="text-[11px] text-slate-400">
            {formData.discount_type === 'FIXED' ? 'Amount in VND (e.g. 100000 = 100,000 VND)' : 'Percentage value (1 - 100%)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="valid_from" className="text-xs font-semibold text-slate-700">
            Valid From Date & Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valid_from"
            name="valid_from"
            type="datetime-local"
            value={formData.valid_from}
            onChange={(e) => setFormData((prev) => ({ ...prev, valid_from: e.target.value }))}
            required
            className="font-mono text-sm bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_until" className="text-xs font-semibold text-slate-700">
            Valid Until Date & Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valid_until"
            name="valid_until"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData((prev) => ({ ...prev, valid_until: e.target.value }))}
            required
            className="font-mono text-sm bg-white border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
