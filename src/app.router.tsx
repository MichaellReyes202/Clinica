import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { LoginPage } from "./auth/pages/LoginPage";
import LandingPage from "./clinica/pages/LandingPage";
import { ClinicaLayout } from "./clinica/layout/ClinicaLayout";




export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <ClinicaLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'especialidad/:exam'
      }
    ]
  },
  // auth routes 
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={'/auth/login'} />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <h2>Register Page</h2>
      }
    ]
  },
  // Admin routes 
  {
    path: '/admin',
    element: <h1>Admin Layout</h1>,
    children: [
      {
        index: true,
        element: <h2>DashboardPage</h2>
      },
      {
        path: 'new_patient',
        element: <h2>Register Page</h2>
      },
    ]
  }
])