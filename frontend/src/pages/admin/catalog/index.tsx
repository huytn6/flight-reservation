import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCatalog: React.FC = () => {
  const [subTab, setSubTab] = useState<'AIRPORTS' | 'AIRLINES' | 'AIRCRAFT' | 'FLIGHTS'>('AIRPORTS');
  const [airports, setAirports] = useState<any[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Airport Form
  const [apIata, setApIata] = useState('');
  const [apName, setApName] = useState('');
  const [apCity, setApCity] = useState('');
  const apCountry = 'Vietnam';
  const apCountryCode = 'VN';
  const apTimezone = 'Asia/Ho_Chi_Minh';

  // Airline Form
  const [alIata, setAlIata] = useState('');
  const [alName, setAlName] = useState('');

  // Flight Form
  const [flNum, setFlNum] = useState('');
  const flAirlineId = '';
  const flDepId = '';
  const flArrId = '';
  const [flDepTime, setFlDepTime] = useState('2026-08-20T08:00:00');
  const [flArrTime, setFlArrTime] = useState('2026-08-20T10:10:00');

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'AIRPORTS') {
        const res = await adminService.getAirports();
        setAirports(res || []);
      } else if (subTab === 'AIRLINES') {
        const res = await adminService.getAirlines();
        setAirlines(res || []);
      } else if (subTab === 'AIRCRAFT') {
        const res = await adminService.getAircraftTypes();
        setAircraftTypes(res || []);
      } else {
        const res = await adminService.getFlights();
        setFlights(res.items || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAirport({
        iata_code: apIata.toUpperCase(),
        name: apName,
        city: apCity,
        country: apCountry,
        country_code: apCountryCode,
        timezone: apTimezone,
      });
      toast.success('Airport created!');
      setApIata('');
      setApName('');
      setApCity('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create airport');
    }
  };

  const handleDeleteAirport = async (id: string) => {
    try {
      await adminService.deleteAirport(id);
      toast.success('Airport deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete airport');
    }
  };

  const handleCreateAirline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAirline({ iata_code: alIata.toUpperCase(), name: alName });
      toast.success('Airline created!');
      setAlIata('');
      setAlName('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create airline');
    }
  };

  const handleDeleteAirline = async (id: string) => {
    try {
      await adminService.deleteAirline(id);
      toast.success('Airline deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete airline');
    }
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createFlight({
        flight_number: flNum.toUpperCase(),
        airline_id: flAirlineId || airlines[0]?.id,
        departure_airport_id: flDepId || airports[0]?.id,
        arrival_airport_id: flArrId || airports[1]?.id,
        departure_time: flDepTime,
        arrival_time: flArrTime,
        duration_minutes: 130,
      });
      toast.success('Flight created!');
      setFlNum('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create flight');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flight Catalog Management</h1>
          <p className="text-xs text-slate-500">Configure airports, airlines, aircraft models, flights, and fare inventory.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border gap-1 text-xs font-semibold">
          {['AIRPORTS', 'AIRLINES', 'AIRCRAFT', 'FLIGHTS'].map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === t ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Forms based on active subTab */}
      {subTab === 'AIRPORTS' && (
        <form onSubmit={handleCreateAirport} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create New Airport
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="IATA Code (e.g. SGN)" value={apIata} onChange={(e) => setApIata(e.target.value)} required className="text-xs uppercase font-mono" />
            <Input placeholder="Airport Name" value={apName} onChange={(e) => setApName(e.target.value)} required className="text-xs" />
            <Input placeholder="City" value={apCity} onChange={(e) => setApCity(e.target.value)} required className="text-xs" />
          </div>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl w-fit px-5">Create Airport</Button>
        </form>
      )}

      {subTab === 'AIRLINES' && (
        <form onSubmit={handleCreateAirline} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-md">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create New Airline
          </h2>
          <div className="flex gap-2">
            <Input placeholder="IATA (VN)" value={alIata} onChange={(e) => setAlIata(e.target.value)} required className="text-xs uppercase font-mono w-24" />
            <Input placeholder="Airline Name" value={alName} onChange={(e) => setAlName(e.target.value)} required className="text-xs flex-1" />
          </div>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl w-fit px-5">Create Airline</Button>
        </form>
      )}

      {subTab === 'FLIGHTS' && (
        <form onSubmit={handleCreateFlight} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create Flight Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Flight No (VN 218)" value={flNum} onChange={(e) => setFlNum(e.target.value)} required className="text-xs uppercase font-mono" />
            <Input type="datetime-local" value={flDepTime} onChange={(e) => setFlDepTime(e.target.value)} required className="text-xs" />
            <Input type="datetime-local" value={flArrTime} onChange={(e) => setFlArrTime(e.target.value)} required className="text-xs" />
          </div>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl w-fit px-5">Create Flight</Button>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl border shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b pb-3 mb-3">{subTab} Catalog List</h2>
        {loading ? (
          <p className="text-xs text-slate-500">Loading catalog...</p>
        ) : (
          <div className="overflow-x-auto">
            {subTab === 'AIRPORTS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">IATA</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">City</th>
                    <th className="pb-2">Country</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {airports.map((ap) => (
                    <tr key={ap.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold font-mono text-emerald-700">{ap.iata_code}</td>
                      <td className="py-2.5 font-semibold text-slate-900">{ap.name}</td>
                      <td className="py-2.5 text-slate-600">{ap.city}</td>
                      <td className="py-2.5 text-slate-500">{ap.country}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteAirport(ap.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {subTab === 'AIRLINES' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">IATA</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {airlines.map((al) => (
                    <tr key={al.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold font-mono text-emerald-700">{al.iata_code}</td>
                      <td className="py-2.5 font-semibold text-slate-900">{al.name}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteAirline(al.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {subTab === 'AIRCRAFT' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Model</th>
                    <th className="pb-2">Manufacturer</th>
                    <th className="pb-2">Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {aircraftTypes.map((at) => (
                    <tr key={at.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{at.model}</td>
                      <td className="py-2.5 text-slate-700">{at.manufacturer}</td>
                      <td className="py-2.5 font-bold text-emerald-700">{at.total_seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {subTab === 'FLIGHTS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Flight No</th>
                    <th className="pb-2">Departure</th>
                    <th className="pb-2">Arrival</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {flights.map((fl) => (
                    <tr key={fl.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold font-mono text-emerald-700">{fl.flight_number}</td>
                      <td className="py-2.5 text-slate-800">{fl.departure_time}</td>
                      <td className="py-2.5 text-slate-800">{fl.arrival_time}</td>
                      <td className="py-2.5 font-bold text-blue-600">{fl.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
