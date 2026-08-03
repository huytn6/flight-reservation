import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
          Model Code / ICAO Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="code"
          name="code"
          value={formData.code}
          onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
          placeholder="e.g. A320, A321, B787"
          required
          disabled={mode === 'edit'}
          className="uppercase tracking-wider font-mono text-sm bg-white border-slate-200"
        />
        <p className="text-[11px] text-slate-400">Unique aircraft type code identifier.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model" className="text-xs font-semibold text-slate-700">
          Model Description <span className="text-red-500">*</span>
        </Label>
        <Input
          id="model"
          name="model"
          value={formData.model}
          onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
          placeholder="e.g. Airbus A321-200 / Boeing 787-9 Dreamliner"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer" className="text-xs font-semibold text-slate-700">
          Manufacturer <span className="text-red-500">*</span>
        </Label>
        <Input
          id="manufacturer"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
          placeholder="e.g. Airbus, Boeing, Embraer"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity" className="text-xs font-semibold text-slate-700">
          Total Passenger Capacity <span className="text-red-500">*</span>
        </Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
          placeholder="e.g. 180, 220, 300"
          required
          min={1}
          className="font-mono text-sm bg-white border-slate-200"
        />
      </div>
    </div>
  );
};
