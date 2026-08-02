import React from 'react';
import { SecureBookingHeader } from '@/components/checkout-booking/SecureBookingHeader';
import { TravelerInfoForm } from '@/components/checkout-booking/TravelerInfoForm';
import { StatementCreditBanner } from '@/components/checkout-booking/StatementCreditBanner';
import { PaymentForm } from '@/components/checkout-booking/PaymentForm';
import { CheckoutFlightSummaryCard } from '@/components/checkout-booking/CheckoutFlightSummaryCard';

export const CheckoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans py-6 sm:py-8 pb-20">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Top Header & Banners Section */}
        <SecureBookingHeader />

        {/* 2-Column Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Main Column (2 / 3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TravelerInfoForm />
            <StatementCreditBanner />
            <PaymentForm />
          </div>

          {/* Right Sidebar Column (1 / 3 width) */}
          <div className="lg:col-span-1">
            <CheckoutFlightSummaryCard />
          </div>

        </div>

      </div>
    </div>
  );
};
