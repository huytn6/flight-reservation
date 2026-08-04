import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { ProtectedRoute, GuestGuard } from '@/components/auth/Guards';

import { Home } from '@/pages/home';
import { SignIn } from '@/pages/sign-in';
import { RegisterPage } from '@/pages/register';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { ResetPasswordPage } from '@/pages/reset-password';
import { CheckInPage } from '@/pages/check-in';
import { FlightStatusPage } from '@/pages/flight-status';
import { PublicCmsPage } from '@/pages/public-cms';

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
import { Unauthorized } from '@/pages/unauthorized';
import { ErrorPage } from '@/pages/error';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
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
        path: 'check-in',
        element: <CheckInPage />,
      },
      {
        path: 'flight-status',
        element: <FlightStatusPage />,
      },
      {
        path: 'pages/:slug',
        element: <PublicCmsPage />,
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
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      // Support Tickets (Staff & Admin)
      { path: 'tickets', element: <StaffTickets /> },

      // Flights (Staff & Admin)
      { path: 'flights', element: <FlightsListPage /> },
      { path: 'flights/new', element: <FlightCreatePage /> },
      { path: 'flights/:id', element: <FlightDetailPage /> },
      { path: 'flights/:id/edit', element: <FlightEditPage /> },

      // Airports (Admin Only)
      { path: 'airports', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirportsListPage /></ProtectedRoute> },
      { path: 'airports/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirportCreatePage /></ProtectedRoute> },
      { path: 'airports/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirportEditPage /></ProtectedRoute> },

      // Airlines (Admin Only)
      { path: 'airlines', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirlinesListPage /></ProtectedRoute> },
      { path: 'airlines/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirlineCreatePage /></ProtectedRoute> },
      { path: 'airlines/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><AirlineEditPage /></ProtectedRoute> },

      // Aircraft (Admin Only)
      { path: 'aircraft', element: <ProtectedRoute allowedRoles={['ADMIN']}><AircraftListPage /></ProtectedRoute> },
      { path: 'aircraft/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><AircraftCreatePage /></ProtectedRoute> },
      { path: 'aircraft/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><AircraftEditPage /></ProtectedRoute> },

      // Coupons & Marketing (Admin Only)
      { path: 'coupons', element: <ProtectedRoute allowedRoles={['ADMIN']}><CouponsListPage /></ProtectedRoute> },
      { path: 'coupons/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><CouponCreatePage /></ProtectedRoute> },
      { path: 'coupons/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><CouponEditPage /></ProtectedRoute> },

      // CMS Pages (Admin Only)
      { path: 'cms', element: <ProtectedRoute allowedRoles={['ADMIN']}><CmsListPage /></ProtectedRoute> },
      { path: 'cms/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><CmsCreatePage /></ProtectedRoute> },
      { path: 'cms/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><CmsEditPage /></ProtectedRoute> },

      // Customers & Staff (Admin Only)
      { path: 'customers', element: <ProtectedRoute allowedRoles={['ADMIN']}><CustomersListPage /></ProtectedRoute> },
      { path: 'customers/:id', element: <ProtectedRoute allowedRoles={['ADMIN']}><CustomerDetailPage /></ProtectedRoute> },

      { path: 'staff', element: <ProtectedRoute allowedRoles={['ADMIN']}><StaffListPage /></ProtectedRoute> },
      { path: 'staff/new', element: <ProtectedRoute allowedRoles={['ADMIN']}><StaffCreatePage /></ProtectedRoute> },
      { path: 'staff/:id/edit', element: <ProtectedRoute allowedRoles={['ADMIN']}><StaffEditPage /></ProtectedRoute> },

      // Bookings & Financial (Staff & Admin)
      { path: 'bookings', element: <BookingsListPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },

      // Audit Logs (Admin Only)
      { path: 'audit', element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminAudit /></ProtectedRoute> },

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
      {
        path: 'register',
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'signup',
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        ),
      },
    ],
  },
  {
    path: '/401',
    element: <Unauthorized />,
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
