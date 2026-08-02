import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactTopSearchBar } from '@/components/flight-results/CompactTopSearchBar';
import { FlightFilterSidebar } from '@/components/flight-results/FlightFilterSidebar';
import { DatePriceMatrix } from '@/components/flight-results/DatePriceMatrix';
import { FlightCard, type FlightResultItem } from '@/components/flight-results/FlightCard';
import { SortDropdown } from '@/components/flight-results/SortDropdown';
import { FlightDetailDrawer } from '@/components/flight-results/FlightDetailDrawer';

const FLIGHTS_ALL: FlightResultItem[] = [
  {
    id: 'f-1',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 218',
    departureTime: '7:00pm',
    arrivalTime: '9:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-2',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 220',
    departureTime: '8:00pm',
    arrivalTime: '10:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-3',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 224',
    departureTime: '8:30pm',
    arrivalTime: '10:45pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 15m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-4',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 280',
    departureTime: '10:00pm',
    arrivalTime: '12:10am',
    arrivalDayNext: '+1',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-5',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 222',
    departureTime: '9:00pm',
    arrivalTime: '11:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-6',
    airline: 'Vietnam Airlines operated by Jetstar Pacific',
    flightNumber: 'VN 4310',
    departureTime: '10:55pm',
    arrivalTime: '1:10am',
    arrivalDayNext: '+1',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 15m',
    stops: 'Nonstop',
    price: 187,
    priceDiff: '+$31',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-7',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 216',
    departureTime: '6:00pm',
    arrivalTime: '8:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 209,
    priceDiff: '+$53',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-8',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 210',
    departureTime: '7:00am',
    arrivalTime: '9:10am',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 209,
    priceDiff: '+$53',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-9',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 175',
    departureTime: '5:30am',
    arrivalTime: '7:40am',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 156,
    priceDiff: '+$0',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-10',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 181',
    departureTime: '4:15pm',
    arrivalTime: '6:25pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 156,
    priceDiff: '+$0',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-11',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 183',
    departureTime: '5:45pm',
    arrivalTime: '7:55pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 156,
    priceDiff: '+$0',
    seatsLeftText: '2 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-12',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 214',
    departureTime: '11:00am',
    arrivalTime: '1:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 198,
    priceDiff: '+$42',
    seatsLeftText: '3 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-13',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 212',
    departureTime: '12:30pm',
    arrivalTime: '2:40pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 198,
    priceDiff: '+$42',
    seatsLeftText: '5 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-14',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 189',
    departureTime: '2:00pm',
    arrivalTime: '4:10pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 165,
    priceDiff: '+$9',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-15',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 226',
    departureTime: '3:15pm',
    arrivalTime: '5:25pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 215,
    priceDiff: '+$59',
    seatsLeftText: '3 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-16',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 191',
    departureTime: '9:30pm',
    arrivalTime: '11:40pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 156,
    priceDiff: '+$0',
    seatsLeftText: '6 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-17',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 230',
    departureTime: '6:30am',
    arrivalTime: '8:40am',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 220,
    priceDiff: '+$64',
    seatsLeftText: '2 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-18',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 232',
    departureTime: '1:45pm',
    arrivalTime: '3:55pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 225,
    priceDiff: '+$69',
    seatsLeftText: '4 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-19',
    airline: 'Vietjet Air',
    flightNumber: 'VJ 195',
    departureTime: '11:50pm',
    arrivalTime: '2:00am',
    arrivalDayNext: '+1',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 156,
    priceDiff: '+$0',
    seatsLeftText: '5 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
  {
    id: 'f-20',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN 236',
    departureTime: '10:30am',
    arrivalTime: '12:40pm',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureCity: 'Hanoi',
    arrivalCity: 'Ho Chi Min...',
    duration: '2h 10m',
    stops: 'Nonstop',
    price: 230,
    priceDiff: '+$74',
    seatsLeftText: '3 left at',
    roundtripLabel: 'Roundtrip per traveler',
  },
];

export const FlightResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState('Recommended');
  const [selectedFlight, setSelectedFlight] = useState<FlightResultItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleFlightCardClick = (flight: FlightResultItem) => {
    setSelectedFlight(flight);
    setIsDrawerOpen(true);
  };

  const handleConfirmFare = (_flight: FlightResultItem) => {
    setIsDrawerOpen(false);
    navigate('/review-trip');
  };

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 5, FLIGHTS_ALL.length));
      setIsLoadingMore(false);
    }, 700);
  };

  const visibleFlights = FLIGHTS_ALL.slice(0, visibleCount);
  const hasMore = visibleCount < FLIGHTS_ALL.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* Top Single Row Compact Search Bar */}
      <CompactTopSearchBar />

      {/* Main Content Container */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <FlightFilterSidebar />

          {/* Right Main Content Column */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">
            
            {/* Step Breadcrumb & Protection Banner */}
            {selectedFlight ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 flex-wrap">
                    <span>Vietnam Airlines - HAN → SGN</span>
                    <span className="text-slate-400 font-normal">&gt;</span>
                    <span className="text-slate-900 font-bold">Choose returning flight</span>
                    <span className="text-slate-400 font-normal">&gt;</span>
                    <span className="text-slate-400 font-normal">Review your trip</span>
                  </div>
                  <button 
                    onClick={() => setSelectedFlight(null)} 
                    className="text-[#0065eb] hover:underline font-medium text-left cursor-pointer w-fit"
                  >
                    Change flight
                  </button>
                </div>
              </div>
            ) : (
              /* Surrounding 7-Date Price Matrix */
              <DatePriceMatrix />
            )}

            {/* Title & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-1">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {selectedFlight ? 'Returning flights' : 'Departing flights'}
                </h1>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                  <a href="#" className="underline hover:text-slate-800">
                    How our sort order and personalized savings work
                  </a>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[11px] text-gray-400">
                  Final prices and fees are confirmed before you pay.
                </span>
              </div>

              {/* Sort Dropdown Box */}
              <div className="self-start sm:self-center">
                <SortDropdown selectedKey={sortOption} onSelectSort={setSortOption} />
              </div>
            </div>

            {/* List of Flight Cards */}
            <div className="flex flex-col gap-2">
              {visibleFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  isSelected={selectedFlight?.id === flight.id}
                  onSelect={handleFlightCardClick}
                />
              ))}
            </div>

            {/* Show More Button with Loader2 Loading */}
            {hasMore && (
              <div className="flex flex-col items-center justify-center mt-6">
                <Button
                  disabled={isLoadingMore}
                  onClick={handleShowMore}
                  variant="outline"
                  className="bg-transparent border border-slate-400 hover:border-slate-600 text-[#0065eb] hover:bg-blue-50/10 font-normal text-sm sm:text-base rounded-full py-2 px-6.5 transition-all cursor-pointer shadow-none flex items-center justify-center gap-2"
                >
                  {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin text-[#0065eb]" />}
                  <span>{isLoadingMore ? 'Loading...' : 'Show More'}</span>
                </Button>
              </div>
            )}

          </main>

        </div>
      </div>

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
