import React from 'react';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { BookingSearchCard } from '@/components/flight/BookingSearchCard';
import { FlightDealsSection } from '@/components/flight/FlightDealsSection';
import { RecentActivitySection } from '@/components/RecentActivitySection';
import { TravelValueBanners } from '@/components/promotion/TravelValueBanners';

export const Home: React.FC = () => {
  return (
    <>
      <HeroBanner title="Nơi duy nhất bạn cần để chinh phục mọi điểm đến" />
      
      <BookingSearchCard />

      <RecentActivitySection />

      <FlightDealsSection title="Điểm Đến Phổ Biến Từ TP. Hồ Chí Minh" />

      <TravelValueBanners />
    </>
  );
};
