import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/admin/DateTimePicker';

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

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Card 1: Thông tin chuyến bay & Lịch trình */}
      <Card className="bg-white border-0 shadow-none rounded-lg py-0">
        <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
          <CardTitle className="text-xs font-semibold text-slate-900">
            Hành Trình & Lịch Khởi Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
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
              className="uppercase font-mono text-xs bg-white border-slate-200/60 shadow-none h-8.5"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Hãng Hàng Không <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.airline_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, airline_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200/60 shadow-none h-8.5">
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

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Sân Bay Cất Cánh (Điểm Khởi Hành) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.departure_airport_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, departure_airport_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200/60 shadow-none h-8.5">
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

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Sân Bay Hạ Cánh (Điểm Đến) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.arrival_airport_id}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, arrival_airport_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200/60 shadow-none h-8.5">
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

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Thời Gian Cất Cánh <span className="text-red-500">*</span>
            </Label>
            <DateTimePicker
              value={formData.departure_time}
              onChange={(val) => setFormData((prev) => ({ ...prev, departure_time: val }))}
              placeholder="Chọn ngày & giờ cất cánh..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Thời Gian Hạ Cánh <span className="text-red-500">*</span>
            </Label>
            <DateTimePicker
              value={formData.arrival_time}
              onChange={(val) => setFormData((prev) => ({ ...prev, arrival_time: val }))}
              placeholder="Chọn ngày & giờ hạ cánh..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Phân công tàu bay & Trạng thái */}
      <Card className="bg-white border-0 shadow-none rounded-lg py-0">
        <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
          <CardTitle className="text-xs font-semibold text-slate-900">
            Tàu Bay & Trạng Thái Vận Hành
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Dòng Máy Bay
            </Label>
            <Select
              value={formData.aircraft_type_id || ''}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, aircraft_type_id: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200/60 shadow-none h-8.5">
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

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Trạng Thái Chuyến Bay
            </Label>
            <Select
              value={formData.status || 'SCHEDULED'}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="text-xs bg-white border-slate-200/60 shadow-none h-8.5">
                <SelectValue placeholder="Chọn trạng thái..." />
              </SelectTrigger>
              <SelectContent className="font-sans">
                <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                <SelectItem value="BOARDING">Đang cho lên máy bay</SelectItem>
                <SelectItem value="DEPARTED">Đang thực hiện chuyến bay</SelectItem>
                <SelectItem value="ARRIVED">Đã hạ cánh an toàn</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy chuyến</SelectItem>
                <SelectItem value="DELAYED">Tạm hoãn (Bị trễ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
