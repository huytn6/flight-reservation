import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MOCK_NAV_ITEMS } from '@/constants/mockNavigation';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-blue-100 relative flex flex-col justify-between">
      <Header
        brandName="Expedia"
        navItems={MOCK_NAV_ITEMS}
        currency="USD"
        currencyFlag="🇺🇸"
        signInLabel="Sign in"
        onSignInClick={() => navigate('/signin')}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
