import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewTripBreadcrumb } from '@/components/checkout/ReviewTripBreadcrumb';
import { FlightSummaryCard } from '@/components/checkout/FlightSummaryCard';
import { FareInformationCard } from '@/components/checkout/FareInformationCard';
import { PriceDropProtectionCard } from '@/components/checkout/PriceDropProtectionCard';
import { PriceSummaryCard } from '@/components/checkout/PriceSummaryCard';
import { CancellationPolicyCard } from '@/components/checkout/CancellationPolicyCard';
import type { FlightSegmentData } from '@/components/checkout/FlightSegment';
import { FlightDetailModal } from '@/components/flight-results/FlightDetailModal';

const MOCK_FLIGHT_SEGMENTS: FlightSegmentData[] = [
  {
    id: 'seg-1',
    originCity: 'Ho Chi Minh City',
    destinationCity: 'Hanoi',
    departureTime: '4:45pm',
    arrivalTime: '6:55pm',
    duration: '2h 10m',
    stops: 'nonstop',
    airline: 'Vietjet Air',
    dateText: 'Fri, Aug 14',
  },
  {
    id: 'seg-2',
    originCity: 'Hanoi',
    destinationCity: 'Ho Chi Minh City',
    departureTime: '11:25pm',
    arrivalTime: '1:35am',
    duration: '2h 10m',
    stops: 'nonstop',
    airline: 'Vietjet Air',
    dateText: 'Fri, Aug 21',
  },
];

export const ReviewTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState<FlightSegmentData | null>(null);

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  const handleChangeFlight = (_id: string) => {
    navigate('/Flights-Search');
  };

  const handleFlightDetailsClick = (id: string) => {
    const found = MOCK_FLIGHT_SEGMENTS.find((s) => s.id === id);
    if (found) {
      setSelectedSegment(found);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans py-6 md:py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-4">
        
        {/* Top Breadcrumb Navigation */}
        <ReviewTripBreadcrumb />

        {/* Page Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Review your trip
        </h1>

        {/* 2-Column Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2 / 3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Card 1: Flight Summary */}
            <FlightSummaryCard
              segments={MOCK_FLIGHT_SEGMENTS}
              onFlightDetailsClick={handleFlightDetailsClick}
              onChangeFlightClick={handleChangeFlight}
            />

            {/* Card 2: Your Fare Information */}
            <FareInformationCard />

            {/* Card 3: Price Drop Protection */}
            <PriceDropProtectionCard />
          </div>

          {/* Right Sidebar Column (1 / 3 width) */}
          <div className="flex flex-col gap-5">
            {/* Sidebar Card 1: Price Details & Checkout Button */}
            <PriceSummaryCard 
              travelerTotalText="$120.20"
              totalAmountText="$120.20"
              onCheckout={handleCheckoutClick} 
            />
            
            {/* Sidebar Card 2: Free Cancellation Notice */}
            <CancellationPolicyCard />
          </div>

        </div>

      </div>

      {/* Flight Detail Modal Popup */}
      <FlightDetailModal
        isOpen={Boolean(selectedSegment)}
        onClose={() => setSelectedSegment(null)}
        segment={selectedSegment}
      />
    </div>
  );
};
