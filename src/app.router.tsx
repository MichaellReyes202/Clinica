import { createBrowserRouter, Navigate } from "react-router";




export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <h1>Home Layout</h1>,
    children: [
      {
        index: true,
        element: <h2>HomePage</h2>
      },
      {
        path: 'especialidad/:exam'
      }
    ]
  },
  // auth routes 
  {
    path: '/auth',
    element: <h2>AuthLayout</h2>,
    children: [
      {
        index: true,
        element: <Navigate to={'/auth/login'} />
      },
      {
        path: 'login',
        element: <h2>Login page</h2>
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