import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FlightFormData {
  flight_number: string;
  airline_id: string;
  departure_airport_id: string;
  arrival_airport_id: string;
  aircraft_type_id?: string;
  departure_time: string;
  arrival_time: string;
  base_price?: number;
  status?: string;
}

interface FlightFormProps {
  formData: FlightFormData;
  setFormData: React.Dispatch<React.SetStateAction<FlightFormData>>;
  mode?: 'create' | 'edit';
}

export const FlightForm: React.FC<FlightFormProps> = ({
  formData,
  setFormData,
}) => {
  const [airlines, setAirlines] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [alRes, apRes, acRes] = await Promise.all([
        adminService.getAirlines(),
        adminService.getAirports(),
        adminService.getAircraftTypes(),
      ]);
      setAirlines(alRes || []);
      setAirports(apRes || []);
      setAircraftTypes(acRes || []);
    } catch (err) {
      console.error('Failed to load flight form options', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Card 1: Thông tin chuyến bay & Lịch trình */}
      <Card className="bg-white border-slate-200/80 shadow-none rounded-lg overflow-hidden">
        <CardHeader className="p-4 sm:p-5 bg-white border-b border-slate-100">
          <CardTitle className="text-xs font-semibold text-slate-900">
            Hành Trình & Lịch Khởi Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="flight_number" className="text-xs font-medium text-slate-700">
              Số Hiệu Chuyến Bay <span className="text-red-500">*</span>
            </Label>
            <Input
              id="flight_number"
              name="flight_number"
              value={formData.flight_number}
              onChange={(e) => setFormData((prev) => ({ ...prev, flight_number: e.target.value.toUpperCase() }))}
              placeholder="VD: VN210, VJ123"
              required
              className="uppercase font-mono text-xs bg-white border-slate-200 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Hãng Hàng Không <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.airline_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, airline_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
                <SelectValue placeholder="Chọn hãng bay..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                {airlines.map((al) => (
                  <SelectItem key={al.id} value={al.id} className="text-xs">
                    {al.name} ({al.iata_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Sân Bay Cất Cánh (Origin) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.departure_airport_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, departure_airport_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
                <SelectValue placeholder="Chọn sân bay cất cánh..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                {airports.map((ap) => (
                  <SelectItem key={ap.id} value={ap.id} className="text-xs">
                    {ap.city} ({ap.iata_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Sân Bay Hạ Cánh (Destination) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.arrival_airport_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, arrival_airport_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
                <SelectValue placeholder="Chọn sân bay hạ cánh..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                {airports.map((ap) => (
                  <SelectItem key={ap.id} value={ap.id} className="text-xs">
                    {ap.city} ({ap.iata_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="departure_time" className="text-xs font-medium text-slate-700">
              Thời Gian Cất Cánh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="departure_time"
              name="departure_time"
              type="datetime-local"
              value={formData.departure_time}
              onChange={handleChange}
              required
              className="text-xs bg-white border-slate-200 font-mono h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="arrival_time" className="text-xs font-medium text-slate-700">
              Thời Gian Hạ Cánh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="arrival_time"
              name="arrival_time"
              type="datetime-local"
              value={formData.arrival_time}
              onChange={handleChange}
              required
              className="text-xs bg-white border-slate-200 font-mono h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Phân công tàu bay & Trạng thái */}
      <Card className="bg-white border-slate-200/80 shadow-none rounded-lg overflow-hidden">
        <CardHeader className="p-4 sm:p-5 bg-white border-b border-slate-100">
          <CardTitle className="text-xs font-semibold text-slate-900">
            Tàu Bay & Trạng Thái Vận Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Dòng Máy Bay
            </Label>
            <Select
              value={formData.aircraft_type_id || ''}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, aircraft_type_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
                <SelectValue placeholder="Chọn dòng máy bay..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                {aircraftTypes.map((ac) => (
                  <SelectItem key={ac.id} value={ac.id} className="text-xs">
                    {ac.model} ({ac.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Trạng Thái Chuyến Bay
            </Label>
            <Select
              value={formData.status || 'SCHEDULED'}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200 h-9">
                <SelectValue placeholder="Chọn trạng thái..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                <SelectItem value="BOARDING">Đang lên máy bay</SelectItem>
                <SelectItem value="DEPARTED">Đang bay</SelectItem>
                <SelectItem value="ARRIVED">Đã hạ cánh</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="DELAYED">Bị trễ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
