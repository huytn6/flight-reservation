import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface AircraftFormData {
  code: string;
  model: string;
  manufacturer: string;
  capacity: number;
}

interface AircraftFormProps {
  formData: AircraftFormData;
  setFormData: React.Dispatch<React.SetStateAction<AircraftFormData>>;
  mode: 'create' | 'edit';
}

export const AircraftForm: React.FC<AircraftFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  return (
    <Card className="bg-white border-0 shadow-none rounded-lg py-0 font-sans">
      <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Thông Tin Loại Máy Bay
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <Label htmlFor="code" className="text-xs font-medium text-slate-700">
            Mã Ký Hiệu Máy Bay <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="VD: A320, A321, B787"
            required
            disabled={mode === 'edit'}
            className="uppercase font-mono text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="model" className="text-xs font-medium text-slate-700">
            Tên Dòng Máy Bay <span className="text-red-500">*</span>
          </Label>
          <Input
            id="model"
            name="model"
            value={formData.model}
            onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
            placeholder="VD: Airbus A321-200"
            required
            className="text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="manufacturer" className="text-xs font-medium text-slate-700">
            Hãng Sản Xuất <span className="text-red-500">*</span>
          </Label>
          <Input
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
            placeholder="VD: Airbus, Boeing"
            required
            className="text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="capacity" className="text-xs font-medium text-slate-700">
            Sức Chứa Ghế Ngồi <span className="text-red-500">*</span>
          </Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
            placeholder="VD: 180, 220"
            required
            min={1}
            className="font-mono text-xs bg-white border-slate-200/60 shadow-none h-8.5"
          />
        </div>
      </CardContent>
    </Card>
  );
};
