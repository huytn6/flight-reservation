import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit2, Plane, Clock, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

export const FlightDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<any>(null);
  const [seatMap, setSeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFlights();
      const fl = (res.items || []).find((f: any) => f.id === id || f.flight_number === id);
      setFlight(fl || null);

      if (id) {
        try {
          const map = await adminService.getSeatMap(id);
          setSeatMap(map);
        } catch {
          // seat map optional
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load flight detail');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading flight detail...</div>;
  }

  if (!flight) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Flight not found.</p>
        <Button size="sm" onClick={() => navigate('/admin/flights')}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/flights')}
          className="text-xs text-slate-600 hover:text-slate-900 bg-white border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Flights List
        </Button>

        <Button
          onClick={() => navigate(`/admin/flights/${id}/edit`)}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-8 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Flight
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-6 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Badge className="bg-blue-50 text-[#0065eb] border border-blue-200 font-mono text-sm px-2.5 py-0.5">
                  {flight.flight_number}
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                  {flight.status || 'SCHEDULED'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-2">
                {flight.airline_name || 'Carrier'} Route
              </CardTitle>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] uppercase">Origin</p>
                <p className="text-slate-900 font-bold text-sm">{flight.departure_iata || 'SGN'}</p>
              </div>
              <div className="w-8 h-px bg-slate-300 relative">
                <Plane className="w-3 h-3 text-[#0065eb] absolute -top-1.5 left-2.5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase">Destination</p>
                <p className="text-slate-900 font-bold text-sm">{flight.arrival_iata || 'HAN'}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Departure Time
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">
                {flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Arrival Time
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">
                {flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Seat Capacity
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">
                {seatMap?.capacity || 180} Seats Available
              </p>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Seat Map Overview
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              {seatMap?.rows ? (
                <p>Configured {seatMap.rows.length} rows layout.</p>
              ) : (
                <p>Standard Commercial Layout (Economy & Business Classes Active).</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
