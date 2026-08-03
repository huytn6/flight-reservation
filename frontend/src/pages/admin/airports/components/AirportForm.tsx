import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AirportFormData {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  country_code: string;
  timezone: string;
}

interface AirportFormProps {
  formData: AirportFormData;
  setFormData: React.Dispatch<React.SetStateAction<AirportFormData>>;
  mode: 'create' | 'edit';
}

export const AirportForm: React.FC<AirportFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <Label htmlFor="iata_code" className="text-xs font-semibold text-slate-700">
          IATA Code (3 Letters) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="iata_code"
          name="iata_code"
          value={formData.iata_code}
          onChange={(e) => setFormData((prev) => ({ ...prev, iata_code: e.target.value.toUpperCase() }))}
          placeholder="e.g. SGN, HAN, DAD"
          maxLength={3}
          required
          disabled={mode === 'edit'}
          className="uppercase tracking-wider font-mono text-sm bg-white border-slate-200"
        />
        <p className="text-[11px] text-slate-400">Unique 3-letter IATA airport code.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
          Airport Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Tan Son Nhat International Airport"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
          City <span className="text-red-500">*</span>
        </Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="e.g. Ho Chi Minh City"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-xs font-semibold text-slate-700">
          Country <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="e.g. Vietnam"
          required
          className="text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country_code" className="text-xs font-semibold text-slate-700">
          Country Code (2 Letters)
        </Label>
        <Input
          id="country_code"
          name="country_code"
          value={formData.country_code}
          onChange={(e) => setFormData((prev) => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
          placeholder="e.g. VN"
          maxLength={2}
          className="uppercase font-mono text-sm bg-white border-slate-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-xs font-semibold text-slate-700">
          Timezone
        </Label>
        <Input
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          placeholder="e.g. Asia/Ho_Chi_Minh"
          className="font-mono text-sm bg-white border-slate-200"
        />
      </div>
    </div>
  );
};
