import React from 'react';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { BookingSearchCard } from '@/components/flight/BookingSearchCard';
import { FlightDealsSection } from '@/components/flight/FlightDealsSection';
import { RecentActivitySection } from '@/components/RecentActivitySection';
import { TravelValueBanners } from '@/components/promotion/TravelValueBanners';
import { MOCK_AIRPORTS } from '@/constants/mockAirports';

export const HomePage: React.FC = () => {
  const handleSearchSubmit = (searchParams: unknown) => {
    console.log('Flight search submitted:', searchParams);
  };

  return (
    <>
      <HeroBanner title="The one place you go to go places" />
      
      <BookingSearchCard 
        airports={MOCK_AIRPORTS} 
        onSearch={handleSearchSubmit} 
      />

      <RecentActivitySection />

      <FlightDealsSection title="Flight deals from Ho Chi Minh City" />

      <TravelValueBanners />
    </>
  );
};
