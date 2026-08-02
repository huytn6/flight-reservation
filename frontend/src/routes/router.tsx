import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { Home } from '@/pages/home';
import { SignIn } from '@/pages/sign-in';
import { FlightResults } from '@/pages/flight-results';
import { ReviewTrip } from '@/pages/review-trip';
import { Checkout } from '@/pages/checkout';
import { Profile } from '@/pages/profile';
import { SavedFlights } from '@/pages/saved-flights';
import { MyBookings } from '@/pages/my-bookings';
import { BookingDetail } from '@/pages/booking-detail';
import { BookingLookup } from '@/pages/booking-lookup';
import { PriceAlerts } from '@/pages/price-alerts';
import { Support } from '@/pages/support';

import { StaffBookings } from '@/pages/staff/bookings';
import { StaffTickets } from '@/pages/staff/tickets';

import { AdminDashboard } from '@/pages/admin/dashboard';
import { AdminUsers } from '@/pages/admin/users';
import { AdminCatalog } from '@/pages/admin/catalog';
import { AdminFinance } from '@/pages/admin/finance';
import { AdminCoupons } from '@/pages/admin/coupons';
import { AdminAudit } from '@/pages/admin/audit';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'flights/search',
        element: <FlightResults />,
      },
      {
        path: 'Flights-Search',
        element: <FlightResults />,
      },
      {
        path: 'review-trip',
        element: <ReviewTrip />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'saved-flights',
        element: <SavedFlights />,
      },
      {
        path: 'my-bookings',
        element: <MyBookings />,
      },
      {
        path: 'bookings/:id',
        element: <BookingDetail />,
      },
      {
        path: 'booking-lookup',
        element: <BookingLookup />,
      },
      {
        path: 'price-alerts',
        element: <PriceAlerts />,
      },
      {
        path: 'support',
        element: <Support />,
      },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <StaffBookings />,
      },
      {
        path: 'tickets',
        element: <StaffTickets />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'catalog',
        element: <AdminCatalog />,
      },
      {
        path: 'finance',
        element: <AdminFinance />,
      },
      {
        path: 'cms',
        element: <AdminCoupons />,
      },
      {
        path: 'audit',
        element: <AdminAudit />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'signin',
        element: <SignIn />,
      },
    ],
  },
  {
    path: '*',
    element: <Home />,
  },
]);
