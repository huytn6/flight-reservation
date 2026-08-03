import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { ProtectedRoute, GuestGuard } from '@/components/auth/Guards';

import { Home } from '@/pages/home';
import { SignIn } from '@/pages/sign-in';
import { FlightResults } from '@/pages/flight-results';
import { ReviewTrip } from '@/pages/review-trip';
import { Checkout } from '@/pages/checkout';
import { Profile } from '@/pages/profile';
import { ProfileEdit } from '@/pages/profile/edit';
import { SavedFlights } from '@/pages/saved-flights';
import { MyBookings } from '@/pages/my-bookings';
import { BookingDetail } from '@/pages/booking-detail';
import { BookingLookup } from '@/pages/booking-lookup';
import { PriceAlerts } from '@/pages/price-alerts';
import { Support } from '@/pages/support';

import { StaffTickets } from '@/pages/staff/tickets';

// Admin Modules
import { AdminDashboard } from '@/pages/admin/dashboard';
import { AdminAudit } from '@/pages/admin/audit';

import { FlightsListPage } from '@/pages/admin/flights';
import { FlightCreatePage } from '@/pages/admin/flights/new/index';
import { FlightDetailPage } from '@/pages/admin/flights/detail/index';
import { FlightEditPage } from '@/pages/admin/flights/edit/index';

import { AirportsListPage } from '@/pages/admin/airports';
import { AirportCreatePage } from '@/pages/admin/airports/new/index';
import { AirportEditPage } from '@/pages/admin/airports/edit/index';

import { AirlinesListPage } from '@/pages/admin/airlines';
import { AirlineCreatePage } from '@/pages/admin/airlines/new/index';
import { AirlineEditPage } from '@/pages/admin/airlines/edit/index';

import { AircraftListPage } from '@/pages/admin/aircraft';
import { AircraftCreatePage } from '@/pages/admin/aircraft/new/index';
import { AircraftEditPage } from '@/pages/admin/aircraft/edit/index';

import { CouponsListPage } from '@/pages/admin/coupons';
import { CouponCreatePage } from '@/pages/admin/coupons/new/index';
import { CouponEditPage } from '@/pages/admin/coupons/edit/index';

import { CmsListPage } from '@/pages/admin/cms';
import { CmsCreatePage } from '@/pages/admin/cms/new/index';
import { CmsEditPage } from '@/pages/admin/cms/edit/index';

import { CustomersListPage } from '@/pages/admin/customers';
import { CustomerDetailPage } from '@/pages/admin/customers/detail/index';

import { StaffListPage } from '@/pages/admin/staff';
import { StaffCreatePage } from '@/pages/admin/staff/new/index';
import { StaffEditPage } from '@/pages/admin/staff/edit/index';

import { BookingsListPage } from '@/pages/admin/bookings';
import { BookingDetailPage } from '@/pages/admin/bookings/detail/index';

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
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <ProfileEdit />
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
  {
    path: '/staff',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/staff/tickets',
    element: <Navigate to="/admin/tickets" replace />,
  },
  // Enterprise Management Portal Protected Routes (Staff & Admin Unified)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      // Support Tickets
      { path: 'tickets', element: <StaffTickets /> },
      // Flights
      { path: 'flights', element: <FlightsListPage /> },
      { path: 'flights/new', element: <FlightCreatePage /> },
      { path: 'flights/:id', element: <FlightDetailPage /> },
      { path: 'flights/:id/edit', element: <FlightEditPage /> },

      // Airports
      { path: 'airports', element: <AirportsListPage /> },
      { path: 'airports/new', element: <AirportCreatePage /> },
      { path: 'airports/:id/edit', element: <AirportEditPage /> },

      // Airlines
      { path: 'airlines', element: <AirlinesListPage /> },
      { path: 'airlines/new', element: <AirlineCreatePage /> },
      { path: 'airlines/:id/edit', element: <AirlineEditPage /> },

      // Aircraft
      { path: 'aircraft', element: <AircraftListPage /> },
      { path: 'aircraft/new', element: <AircraftCreatePage /> },
      { path: 'aircraft/:id/edit', element: <AircraftEditPage /> },

      // Coupons & Marketing
      { path: 'coupons', element: <CouponsListPage /> },
      { path: 'coupons/new', element: <CouponCreatePage /> },
      { path: 'coupons/:id/edit', element: <CouponEditPage /> },

      // CMS Pages
      { path: 'cms', element: <CmsListPage /> },
      { path: 'cms/new', element: <CmsCreatePage /> },
      { path: 'cms/:id/edit', element: <CmsEditPage /> },

      // Customers & Staff
      { path: 'customers', element: <CustomersListPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },

      { path: 'staff', element: <StaffListPage /> },
      { path: 'staff/new', element: <StaffCreatePage /> },
      { path: 'staff/:id/edit', element: <StaffEditPage /> },

      // Bookings & Financial
      { path: 'bookings', element: <BookingsListPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },

      // Audit Logs
      { path: 'audit', element: <AdminAudit /> },

      // Legacy Aliases
      { path: 'catalog', element: <Navigate to="/admin/flights" replace /> },
      { path: 'users', element: <Navigate to="/admin/customers" replace /> },
      { path: 'finance', element: <Navigate to="/admin/bookings" replace /> },
    ],
  },
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
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
