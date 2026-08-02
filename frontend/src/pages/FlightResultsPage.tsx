import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Info, Loader2, Heart, Scale, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactTopSearchBar } from '@/components/flight-results/CompactTopSearchBar';
import { FlightFilterSidebar } from '@/components/flight-results/FlightFilterSidebar';
import { DatePriceMatrix } from '@/components/flight-results/DatePriceMatrix';
import { FlightCard, type FlightResultItem } from '@/components/flight-results/FlightCard';
import { SortDropdown } from '@/components/flight-results/SortDropdown';
import { FlightDetailDrawer } from '@/components/flight-results/FlightDetailDrawer';
import { flightService, type FlightOffer, type FareOption, type FareRule, type FareBaggage } from '@/services/flight';
import { useAuthStore } from '@/store/use-auth';
import { toast } from 'sonner';

export const FlightResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const origin = searchParams.get('origin') || 'SGN';
  const destination = searchParams.get('destination') || 'HAN';
  const departureDate = searchParams.get('departure_date') || '2026-08-15';
  const returnDate = searchParams.get('return_date') || '';
  const tripType = searchParams.get('trip_type') || (returnDate ? 'ROUND_TRIP' : 'ONE_WAY');

  const [sortOption, setSortOption] = useState('price');
  const [loading, setLoading] = useState(true);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);

  // Selected item for drawer
  const [selectedFlight, setSelectedFlight] = useState<FlightResultItem | null>(null);
  const [selectedRawOffer, setSelectedRawOffer] = useState<FlightOffer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fare Comparison Modal State
  const [fareComparisonModal, setFareComparisonModal] = useState<FareOption[] | null>(null);
  const [fareRulesModal, setFareRulesModal] = useState<{ rules: FareRule[]; baggage: FareBaggage | null } | null>(null);

  // Saved flights
  const [savedFlightIds, setSavedFlightIds] = useState<string[]>([]);

  useEffect(() => {
    fetchFlights();
  }, [searchParams, sortOption]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedFlights();
    }
  }, [isAuthenticated]);

  const loadSavedFlights = async () => {
    try {
      const saved = await flightService.getSavedFlights();
      setSavedFlightIds(saved.map((s) => s.flight_id));
    } catch {
      // ignore
    }
  };

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await flightService.searchFlights({
        trip_type: tripType as any,
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate || undefined,
        sort: sortOption as any,
      });

      const rawList: FlightOffer[] = res.outbound?.flights || res.legs?.[0]?.flights || [];
      setFlightOffers(rawList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSaveFlight = async (flightId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save flights');
      navigate('/signin');
      return;
    }
    const isSaved = savedFlightIds.includes(flightId);
    try {
      if (isSaved) {
        // find saved flight id
        const list = await flightService.getSavedFlights();
        const found = list.find((s) => s.flight_id === flightId);
        if (found) {
          await flightService.unsaveFlight(found.id);
          setSavedFlightIds((prev) => prev.filter((id) => id !== flightId));
          toast.success('Flight removed from saved items');
        }
      } else {
        await flightService.saveFlight(flightId);
        setSavedFlightIds((prev) => [...prev, flightId]);
        toast.success('Flight saved to your account!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update saved flight');
    }
  };

  const handleOpenFareComparison = async (flightId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fares = await flightService.getFareComparison(flightId);
      setFareComparisonModal(fares);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load fare comparison');
    }
  };

  const handleOpenFareRules = async (fareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const [rules, baggage] = await Promise.all([
        flightService.getFareRules(fareId),
        flightService.getFareBaggage(fareId),
      ]);
      setFareRulesModal({ rules, baggage });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load fare rules');
    }
  };

  const handleFlightCardClick = (flight: FlightResultItem) => {
    const raw = flightOffers.find((f) => f.id === flight.id);
    setSelectedFlight(flight);
    setSelectedRawOffer(raw || null);
    setIsDrawerOpen(true);
  };

  const handleConfirmFare = (_flight: FlightResultItem) => {
    setIsDrawerOpen(false);
    if (selectedRawOffer) {
      const selectedFare = selectedRawOffer.fares?.[0];
      navigate('/review-trip', {
        state: {
          flight: selectedRawOffer,
          fare: selectedFare,
        },
      });
    } else {
      navigate('/review-trip');
    }
  };

  // Convert FlightOffer -> FlightResultItem
  const flightResultItems: FlightResultItem[] = flightOffers.map((f) => {
    const depDateStr = new Date(f.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrDateStr = new Date(f.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const durationHours = Math.floor(f.duration_minutes / 60);
    const durationMins = f.duration_minutes % 60;

    return {
      id: f.id,
      airline: f.airline.name,
      flightNumber: f.flight_number,
      departureTime: depDateStr,
      arrivalTime: arrDateStr,
      departureAirportCode: f.departure_airport.iata_code,
      arrivalAirportCode: f.arrival_airport.iata_code,
      departureCity: f.departure_airport.city,
      arrivalCity: f.arrival_airport.city,
      duration: `${durationHours}h ${durationMins}m`,
      stops: f.stops === 0 ? 'Nonstop' : `${f.stops} stop`,
      price: f.cheapest_total,
      seatsLeftText: f.fares?.[0]?.available_seats ? `${f.fares[0].available_seats} left` : 'Available',
      roundtripLabel: 'Total price per traveler',
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <CompactTopSearchBar />

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <FlightFilterSidebar />

          <main className="flex-1 flex flex-col gap-4 min-w-0">
            <DatePriceMatrix />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-1">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {origin} → {destination} Flights
                </h1>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                  <span>{flightOffers.length} available flight offers</span>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div className="self-start sm:self-center">
                <SortDropdown selectedKey={sortOption} onSelectSort={setSortOption} />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#0065eb] mb-3" />
                <p className="text-sm font-semibold text-slate-600">Searching flights from backend...</p>
              </div>
            ) : flightOffers.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border text-center flex flex-col items-center">
                <p className="text-lg font-bold text-slate-800">No flights found for this route</p>
                <p className="text-sm text-slate-500 mt-1 mb-4">Try selecting different dates or airports.</p>
                <Button onClick={() => navigate('/')} className="bg-blue-600 text-white rounded-full">
                  Search Again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flightResultItems.map((item, idx) => {
                  const rawOffer = flightOffers[idx];
                  const isSaved = savedFlightIds.includes(rawOffer.id);
                  const cheapestFare = rawOffer.fares?.[0];

                  return (
                    <div key={item.id} className="relative group">
                      <FlightCard
                        flight={item}
                        isSelected={selectedFlight?.id === item.id}
                        onSelect={handleFlightCardClick}
                      />

                      {/* Utility Action Overlay Bar */}
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 rounded-b-xl border-x border-b text-xs text-slate-600 font-medium -mt-1">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => handleOpenFareComparison(rawOffer.id, e)}
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          >
                            <Scale className="w-3.5 h-3.5" /> Compare Fares
                          </button>
                          {cheapestFare && (
                            <button
                              onClick={(e) => handleOpenFareRules(cheapestFare.id, e)}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Fare Rules & Baggage
                            </button>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleToggleSaveFlight(rawOffer.id, e)}
                          className={`flex items-center gap-1 font-semibold transition-colors ${
                            isSaved ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500' : ''}`} />
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Fare Comparison Modal */}
      {fareComparisonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fare Class Options & Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fareComparisonModal.map((fare) => (
                <div key={fare.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">{fare.fare_name}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{fare.cabin_name || 'Economy'}</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{(fare.base_price + fare.tax + fare.fees).toLocaleString()} VND</p>
                  <div className="text-xs text-slate-600 space-y-1 mt-2">
                    <p>• Baggage: {fare.baggage_kg || 20} kg checked, {fare.carry_on_kg || 7} kg carry-on</p>
                    <p>• Refundable: {fare.is_refundable ? 'Yes' : 'No'}</p>
                    <p>• Changeable: {fare.is_changeable ? `Yes (${fare.change_fee?.toLocaleString()} VND fee)` : 'No'}</p>
                    <p>• Seats available: {fare.available_seats}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setFareComparisonModal(null)} className="bg-blue-600 text-white rounded-full">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Fare Rules Modal */}
      {fareRulesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fare Rules & Baggage Allowance</h2>
            {fareRulesModal.baggage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <p className="font-bold mb-1">🧳 Baggage Allowance:</p>
                <p>Checked baggage: {fareRulesModal.baggage.checked_baggage_kg} kg</p>
                <p>Carry-on baggage: {fareRulesModal.baggage.carry_on_kg} kg</p>
              </div>
            )}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-slate-700">Ticket Terms:</p>
              {fareRulesModal.rules.map((r, i) => (
                <div key={i} className="text-xs p-2 bg-slate-100 rounded-lg">
                  <span className="font-bold text-slate-800 uppercase">{r.rule_type}: </span>
                  <span className="text-slate-600">{r.description}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setFareRulesModal(null)} className="bg-blue-600 text-white rounded-full">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Detail Drawer */}
      <FlightDetailDrawer
        isOpen={isDrawerOpen}
        flight={selectedFlight}
        onClose={() => setIsDrawerOpen(false)}
        onSelectFare={handleConfirmFare}
      />
    </div>
  );
};
