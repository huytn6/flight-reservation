import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { HomePage } from '@/pages/HomePage';
import { SignInPage } from '@/pages/SignInPage';
import { FlightResultsPage } from '@/pages/FlightResultsPage';
import { ReviewTripPage } from '@/pages/ReviewTripPage';
import { CheckoutPage } from '@/pages/CheckoutPage';

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
