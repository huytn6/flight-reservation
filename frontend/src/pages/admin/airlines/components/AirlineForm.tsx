import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label htmlFor="iata_code" className="text-xs font-semibold text-slate-700">
          IATA Code (2 Letters) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="iata_code"
          name="iata_code"
          value={formData.iata_code}
          onChange={(e) => setFormData((prev) => ({ ...prev, iata_code: e.target.value.toUpperCase() }))}
          placeholder="e.g. VN, VJ, QH"
          maxLength={2}
          required
          disabled={mode === 'edit'}
          className="uppercase tracking-wider font-mono text-sm bg-white border-slate-200"
        />
        <p className="text-[11px] text-slate-400">Unique 2-letter airline prefix.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
          Airline Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Vietnam Airlines, VietJet Air, Bamboo Airways"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>
    </div>
  );
};
