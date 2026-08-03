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
    <Card className="bg-white border-slate-200/80 shadow-none rounded-lg overflow-hidden font-sans">
      <CardHeader className="p-4 sm:p-5 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Hãng Bay
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
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
            className="uppercase font-mono text-xs bg-white border-slate-200 h-9"
          />
        </div>

        <div className="space-y-1.5">
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
            className="text-xs bg-white border-slate-200 h-9"
          />
        </div>
      </CardContent>
    </Card>
  );
};
