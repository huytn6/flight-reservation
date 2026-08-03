import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaneTakeoff } from 'lucide-react';

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
    <div className="flex flex-col gap-4 font-sans">
      <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PlaneTakeoff className="w-3.5 h-3.5 text-[#0065eb]" />
            Thông Tin Hãng Bay Đối Tác
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="iata_code" className="text-xs font-semibold text-slate-700">
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
              className="uppercase tracking-wider font-mono text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
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
    </div>
  );
};
