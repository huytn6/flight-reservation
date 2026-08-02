import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { StaffLayout } from '@/layouts/StaffLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { ProtectedRoute, GuestGuard } from '@/components/auth/Guards';

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

import { Forbidden } from '@/pages/forbidden';
import { NotFound } from '@/pages/not-found';

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
        path: 'booking-lookup',
        element: <BookingLookup />,
      },
      // Protected Customer Routes
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'saved-flights',
        element: (
          <ProtectedRoute>
            <SavedFlights />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'price-alerts',
        element: (
          <ProtectedRoute>
            <PriceAlerts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'support',
        element: (
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Staff Portal Protected Routes (Staff & Admin)
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
        <StaffLayout />
      </ProtectedRoute>
    ),
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
  // Admin Portal Protected Routes (Admin only)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
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
  // Guest Routes (Already logged-in users redirected to /)
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'signin',
        element: (
          <GuestGuard>
            <SignIn />
          </GuestGuard>
        ),
      },
    ],
  },
  // System Status Routes
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
