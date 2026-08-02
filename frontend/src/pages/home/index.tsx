import React from 'react';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { BookingSearchCard } from '@/components/flight/BookingSearchCard';
import { FlightDealsSection } from '@/components/flight/FlightDealsSection';
import { RecentActivitySection } from '@/components/RecentActivitySection';
import { TravelValueBanners } from '@/components/promotion/TravelValueBanners';

export const Home: React.FC = () => {
  return (
    <>
      <HeroBanner title="The one place you go to go places" />
      
      <BookingSearchCard />

      <RecentActivitySection />

      <FlightDealsSection title="Popular Destinations from Ho Chi Minh City" />

      <TravelValueBanners />
    </>
  );
};
