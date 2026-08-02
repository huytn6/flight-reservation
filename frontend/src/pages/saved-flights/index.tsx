import React, { useEffect, useState } from 'react';
import { flightService, type SavedFlight } from '@/services/flight';
import { Button } from '@/components/ui/button';
import { Trash2, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const SavedFlights: React.FC = () => {
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await flightService.getSavedFlights();
      setSavedFlights(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load saved flights');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id: string) => {
    try {
      await flightService.unsaveFlight(id);
      toast.success('Flight removed');
      loadSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unsave flight');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Plane className="w-6 h-6 text-blue-600" /> Saved Flights
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500">Loading your saved flights...</p>
      ) : savedFlights.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center">
          <p className="text-base font-bold text-slate-800">You haven't saved any flights yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Click the heart icon on any flight offer to save it for later.</p>
          <Button onClick={() => navigate('/flights/search')} className="bg-blue-600 text-white rounded-full">
            Search Flights
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedFlights.map((sf) => (
            <div key={sf.id} className="bg-white p-5 rounded-2xl border shadow-xs flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-600">{sf.flight_number || 'Flight'}</p>
                <p className="text-base font-bold text-slate-900">{sf.origin} → {sf.destination}</p>
                <p className="text-xs text-slate-500">Saved on: {new Date(sf.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(`/flights/search?origin=${sf.origin}&destination=${sf.destination}`)}
                  size="sm"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl"
                >
                  View Offers
                </Button>
                <button
                  onClick={() => handleUnsave(sf.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
