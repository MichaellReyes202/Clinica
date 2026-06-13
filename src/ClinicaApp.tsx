import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"
import { Toaster } from 'sonner';
import { useEffect, type PropsWithChildren } from 'react';
import { useThemeStore } from './store/theme.store';
import { useAuthStore } from './auth/store/auth.store';
import { CustomFullScreenLoading } from './admin/components/CustomFullScreenLoading';
import { ConfirmDialog } from './components/ConfirmDialog';


const CheckAuthProvider = ({ children }: PropsWithChildren) => {

  const { checkAuthStatus, authStatus } = useAuthStore();
  const hasToken = !!localStorage.getItem("token");

  const { isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuthStatus,
    enabled: hasToken,
    retry: false,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!hasToken && authStatus === 'checking') {
      useAuthStore.setState({ authStatus: 'not-authenticated', user: null, token: null });
    }
  }, [hasToken, authStatus]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        useAuthStore.getState().logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (hasToken && isLoading) return <CustomFullScreenLoading />
  return children;
}


const queryClient = new QueryClient();
export const ClinicaApp = () => {
  const { theme } = useThemeStore();
  return (
    <div className={theme} >
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ConfirmDialog />

        <CheckAuthProvider>
          <RouterProvider router={appRouter} />

        </CheckAuthProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  )
}

