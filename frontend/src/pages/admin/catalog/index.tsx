import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
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

  // Columns Definitions
  const airportColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "iata_code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IATA Code" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.getValue("iata_code")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Airport Name" />,
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
    },
    {
      accessorKey: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button onClick={() => handleDeleteAirport(row.original.id)} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const airlineColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "iata_code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IATA Code" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.getValue("iata_code")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Airline Name" />,
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("name")}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button onClick={() => handleDeleteAirline(row.original.id)} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const aircraftColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "model",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aircraft Model" />,
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.getValue("model")}</span>,
    },
    {
      accessorKey: "manufacturer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Manufacturer" />,
    },
    {
      accessorKey: "total_seats",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Seats" />,
      cell: ({ row }) => <span className="font-semibold text-[#0065eb]">{row.getValue("total_seats")}</span>,
    },
  ], []);

  const flightColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "flight_number",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Flight No" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.getValue("flight_number")}</span>,
    },
    {
      accessorKey: "departure_time",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Departure Time" />,
    },
    {
      accessorKey: "arrival_time",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Arrival Time" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("status")}
        </Badge>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Flight Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure airports, airlines, aircraft models, flights, and fare inventory.</p>
        </div>

        <div className="flex bg-white p-1 rounded-md border border-slate-200 gap-1 text-xs font-semibold">
          {['AIRPORTS', 'AIRLINES', 'AIRCRAFT', 'FLIGHTS'].map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t as any)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                subTab === t ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Forms based on active subTab */}
      {subTab === 'AIRPORTS' && (
        <form onSubmit={handleCreateAirport} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-2xl">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0065eb]" /> Create New Airport
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="IATA Code (e.g. SGN)" value={apIata} onChange={(e) => setApIata(e.target.value)} required className="text-xs uppercase font-mono bg-slate-50 border-slate-200" />
            <Input placeholder="Airport Name" value={apName} onChange={(e) => setApName(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
            <Input placeholder="City" value={apCity} onChange={(e) => setApCity(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
          </div>
          <Button type="submit" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">Create Airport</Button>
        </form>
      )}

      {subTab === 'AIRLINES' && (
        <form onSubmit={handleCreateAirline} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-md">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0065eb]" /> Create New Airline
          </h2>
          <div className="flex gap-2">
            <Input placeholder="IATA (VN)" value={alIata} onChange={(e) => setAlIata(e.target.value)} required className="text-xs uppercase font-mono w-24 bg-slate-50 border-slate-200" />
            <Input placeholder="Airline Name" value={alName} onChange={(e) => setAlName(e.target.value)} required className="text-xs flex-1 bg-slate-50 border-slate-200" />
          </div>
          <Button type="submit" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">Create Airline</Button>
        </form>
      )}

      {subTab === 'FLIGHTS' && (
        <form onSubmit={handleCreateFlight} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-2xl">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0065eb]" /> Create Flight Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Flight No (VN 218)" value={flNum} onChange={(e) => setFlNum(e.target.value)} required className="text-xs uppercase font-mono bg-slate-50 border-slate-200" />
            <Input type="datetime-local" value={flDepTime} onChange={(e) => setFlDepTime(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
            <Input type="datetime-local" value={flArrTime} onChange={(e) => setFlArrTime(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
          </div>
          <Button type="submit" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">Create Flight</Button>
        </form>
      )}

      {/* Main Enterprise Reusable DataTable */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-3">{subTab} Catalog List</h2>
        
        {subTab === 'AIRPORTS' && (
          <DataTable
            columns={airportColumns}
            data={airports}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search airport name, city, IATA..."
          />
        )}

        {subTab === 'AIRLINES' && (
          <DataTable
            columns={airlineColumns}
            data={airlines}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search airline name, IATA..."
          />
        )}

        {subTab === 'AIRCRAFT' && (
          <DataTable
            columns={aircraftColumns}
            data={aircraftTypes}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search model, manufacturer..."
          />
        )}

        {subTab === 'FLIGHTS' && (
          <DataTable
            columns={flightColumns}
            data={flights}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search flight number, status..."
          />
        )}
      </div>
    </div>
  );
};

