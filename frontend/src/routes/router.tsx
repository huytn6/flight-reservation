import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { HomePage } from '@/pages/HomePage';
import { SignInPage } from '@/pages/SignInPage';
import { FlightResultsPage } from '@/pages/FlightResultsPage';
import { ReviewTripPage } from '@/pages/ReviewTripPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SavedFlightsPage } from '@/pages/SavedFlightsPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { BookingDetailPage } from '@/pages/BookingDetailPage';
import { BookingLookupPage } from '@/pages/BookingLookupPage';
import { PriceAlertsPage } from '@/pages/PriceAlertsPage';
import { SupportPage } from '@/pages/SupportPage';

import { StaffBookingsPage } from '@/pages/staff/StaffBookingsPage';
import { StaffTicketsPage } from '@/pages/staff/StaffTicketsPage';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminFlightCatalogPage } from '@/pages/admin/AdminFlightCatalogPage';
import { AdminBookingsFinancePage } from '@/pages/admin/AdminBookingsFinancePage';
import { AdminCouponsCMSPage } from '@/pages/admin/AdminCouponsCMSPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'flights/search',
        element: <FlightResultsPage />,
      },
      {
        path: 'Flights-Search',
        element: <FlightResultsPage />,
      },
      {
        path: 'review-trip',
        element: <ReviewTripPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'saved-flights',
        element: <SavedFlightsPage />,
      },
      {
        path: 'my-bookings',
        element: <MyBookingsPage />,
      },
      {
        path: 'bookings/:id',
        element: <BookingDetailPage />,
      },
      {
        path: 'booking-lookup',
        element: <BookingLookupPage />,
      },
      {
        path: 'price-alerts',
        element: <PriceAlertsPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <StaffBookingsPage />,
      },
      {
        path: 'tickets',
        element: <StaffTicketsPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'catalog',
        element: <AdminFlightCatalogPage />,
      },
      {
        path: 'finance',
        element: <AdminBookingsFinancePage />,
      },
      {
        path: 'cms',
        element: <AdminCouponsCMSPage />,
      },
      {
        path: 'audit',
        element: <AdminAuditLogsPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'signin',
        element: <SignInPage />,
      },
    ],
  },
  {
    path: '*',
    element: <HomePage />,
  },
]);
