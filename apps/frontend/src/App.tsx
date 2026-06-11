import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
]);
