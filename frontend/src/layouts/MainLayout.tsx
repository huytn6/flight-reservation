import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-blue-100 relative flex flex-col justify-between">
      <Header brandName="Expedia" />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
