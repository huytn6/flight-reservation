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
import { FlightStatusPage } from '@/pages/flight-status';
import { PublicCmsPage } from '@/pages/public-cms';

import { FlightResults } from '@/pages/flight-results';
import { ReviewTrip } from '@/pages/review-trip';
import { Checkout } from '@/pages/checkout';
import { Profile } from '@/pages/profile';
import { ProfileEdit } from '@/pages/profile/edit';
import { MyBookings } from '@/pages/my-bookings';
import { BookingDetail } from '@/pages/booking-detail';

// Admin Modules
import { AdminDashboard } from '@/pages/admin/dashboard';

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
    ],
  },
  {
    path: '/staff',
    element: <Navigate to="/admin" replace />,
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

      // Bookings & Financial (Staff & Admin)
      { path: 'bookings', element: <BookingsListPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
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
