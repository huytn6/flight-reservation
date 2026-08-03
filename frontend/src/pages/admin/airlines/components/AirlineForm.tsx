import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface AirlineFormData {
  iata_code: string;
  name: string;
}

interface AirlineFormProps {
  formData: AirlineFormData;
  setFormData: React.Dispatch<React.SetStateAction<AirlineFormData>>;
  mode: 'create' | 'edit';
}

export const AirlineForm: React.FC<AirlineFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  return (
    <Card className="bg-white border border-slate-200/60 shadow-none rounded-lg py-0 font-sans">
      <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Hãng Bay
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="iata_code" className="text-xs font-medium text-slate-700">
            Mã IATA Hãng Bay (2 Ký tự) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="iata_code"
            name="iata_code"
            value={formData.iata_code}
            onChange={(e) => setFormData((prev) => ({ ...prev, iata_code: e.target.value.toUpperCase() }))}
            placeholder="VD: VN, VJ, QH"
            maxLength={2}
            required
            disabled={mode === 'edit'}
            className="uppercase font-mono text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-medium text-slate-700">
            Tên Hãng Hàng Không <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="VD: Vietnam Airlines, VietJet Air"
            required
            className="text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>
      </CardContent>
    </Card>
  );
};
