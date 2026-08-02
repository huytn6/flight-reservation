import React, { useEffect, useState } from 'react';
import { flightService, type SavedFlight } from '@/services/flight';
import { Button } from '@/components/ui/button';
import { Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

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
      toast.success('Flight removed from saved list');
      loadSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove saved flight');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8 font-sans">
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-slate-600" /> Saved Flights
      </h1>

      {loading ? (
        <LoadingState message="Loading saved flights..." />
      ) : savedFlights.length === 0 ? (
        <EmptyState
          title="You haven't saved any flights yet"
          description="Click the heart icon on any flight offer to save it for later review."
          actionLabel="Search Flights"
          onAction={() => navigate('/flights/search')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedFlights.map((sf) => (
            <div key={sf.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-none flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-blue-600">{sf.flight_number || 'Flight'}</p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">{sf.origin} → {sf.destination}</p>
                <p className="text-xs text-slate-500">Saved on: {new Date(sf.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(`/flights/search?origin=${sf.origin}&destination=${sf.destination}`)}
                  size="sm"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-xl border border-blue-100 cursor-pointer"
                >
                  View Offers
                </Button>
                <button
                  onClick={() => handleUnsave(sf.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
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
