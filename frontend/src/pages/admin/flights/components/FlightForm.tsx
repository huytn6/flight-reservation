import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="flight_number" className="text-xs font-semibold text-slate-700">
            Flight Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="flight_number"
            name="flight_number"
            value={formData.flight_number}
            onChange={(e) => setFormData((prev) => ({ ...prev, flight_number: e.target.value.toUpperCase() }))}
            placeholder="e.g. VN210, VJ123, QH202"
            required
            className="uppercase tracking-wider font-mono text-sm bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Operating Airline <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.airline_id}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, airline_id: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Operating Airline" />
            </SelectTrigger>
            <SelectContent>
              {airlines.map((al) => (
                <SelectItem key={al.id} value={al.id}>
                  {al.name} ({al.iata_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Departure Airport <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.departure_airport_id}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, departure_airport_id: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Origin Airport" />
            </SelectTrigger>
            <SelectContent>
              {airports.map((ap) => (
                <SelectItem key={ap.id} value={ap.id}>
                  {ap.city} ({ap.iata_code}) - {ap.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Arrival Airport <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.arrival_airport_id}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, arrival_airport_id: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Destination Airport" />
            </SelectTrigger>
            <SelectContent>
              {airports.map((ap) => (
                <SelectItem key={ap.id} value={ap.id}>
                  {ap.city} ({ap.iata_code}) - {ap.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="departure_time" className="text-xs font-semibold text-slate-700">
            Departure Schedule (Date & Time) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="departure_time"
            name="departure_time"
            type="datetime-local"
            value={formData.departure_time}
            onChange={handleChange}
            required
            className="text-sm bg-white border-slate-200 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrival_time" className="text-xs font-semibold text-slate-700">
            Arrival Schedule (Date & Time) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="arrival_time"
            name="arrival_time"
            type="datetime-local"
            value={formData.arrival_time}
            onChange={handleChange}
            required
            className="text-sm bg-white border-slate-200 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Assigned Aircraft Model
          </Label>
          <Select
            value={formData.aircraft_type_id || ''}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, aircraft_type_id: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Aircraft Type" />
            </SelectTrigger>
            <SelectContent>
              {aircraftTypes.map((ac) => (
                <SelectItem key={ac.id} value={ac.id}>
                  {ac.model} ({ac.code} - {ac.capacity} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Flight Operational Status
          </Label>
          <Select
            value={formData.status || 'SCHEDULED'}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
          >
            <SelectTrigger className="text-sm bg-white border-slate-200">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHEDULED">SCHEDULED (Scheduled)</SelectItem>
              <SelectItem value="BOARDING">BOARDING (Now Boarding)</SelectItem>
              <SelectItem value="DEPARTED">DEPARTED (In Flight)</SelectItem>
              <SelectItem value="ARRIVED">ARRIVED (Landed)</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED (Flight Cancelled)</SelectItem>
              <SelectItem value="DELAYED">DELAYED (Delayed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
