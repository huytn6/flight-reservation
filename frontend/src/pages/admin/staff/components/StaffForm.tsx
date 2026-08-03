import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export interface StaffFormData {
  email: string;
  password?: string;
  full_name: string;
  role: 'STAFF' | 'ADMIN';
}

interface StaffFormProps {
  formData: StaffFormData;
  setFormData: React.Dispatch<React.SetStateAction<StaffFormData>>;
  mode: 'create' | 'edit';
}

export const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. Alex Johnson"
            required
            className="text-sm bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Work Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. alex@company.com"
            required
            disabled={mode === 'edit'}
            className="text-sm bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mode === 'create' && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Initial Account Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleChange}
              placeholder="••••••••"
              required={mode === 'create'}
              className="text-sm bg-white border-slate-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Assigned System Role <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.role}
            onValueChange={(val: 'STAFF' | 'ADMIN') => setFormData((prev) => ({ ...prev, role: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">STAFF (Support & Ticket Operator)</SelectItem>
              <SelectItem value="ADMIN">ADMIN (System Administrator)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
