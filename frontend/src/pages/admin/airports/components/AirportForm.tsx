import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';

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
    <div className="flex flex-col gap-4 font-sans">
      {/* Section Card 1: Định Danh Sân Bay */}
      <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#0065eb]" />
            Mã Định Danh & Tên Sân Bay
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="iata_code" className="text-xs font-semibold text-slate-700">
              Mã IATA (3 Ký tự) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="iata_code"
              name="iata_code"
              value={formData.iata_code}
              onChange={(e) => setFormData((prev) => ({ ...prev, iata_code: e.target.value.toUpperCase() }))}
              placeholder="VD: SGN, HAN, DAD"
              maxLength={3}
              required
              disabled={mode === 'edit'}
              className="uppercase tracking-wider font-mono text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Tên Sân Bay Chi Tiết <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Sân bay Quốc tế Tân Sơn Nhất"
              required
              className="text-xs bg-white border-slate-200 h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Card 2: Vị Trí Địa Lý & Múi Giờ */}
      <Card className="bg-white border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 bg-slate-50/60 border-b border-slate-200/80">
          <CardTitle className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0065eb]" />
            Vị Trí Địa Lý & Múi Giờ Vận Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
              Thành Phố / Tỉnh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="VD: Hồ Chí Minh"
              required
              className="text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs font-semibold text-slate-700">
              Quốc Gia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="VD: Việt Nam"
              required
              className="text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country_code" className="text-xs font-semibold text-slate-700">
              Mã Quốc Gia (ISO)
            </Label>
            <Input
              id="country_code"
              name="country_code"
              value={formData.country_code}
              onChange={(e) => setFormData((prev) => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
              placeholder="VD: VN"
              maxLength={2}
              className="uppercase font-mono text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs font-semibold text-slate-700">
              Múi Giờ Địa Phương
            </Label>
            <Input
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              placeholder="VD: Asia/Ho_Chi_Minh"
              className="font-mono text-xs bg-white border-slate-200 h-9"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
