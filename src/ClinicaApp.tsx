import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"
import { Toaster } from 'sonner';
import { useThemeStore } from './store/theme.store';


const queryClient = new QueryClient();
export const ClinicaApp = () => {

  const { theme } = useThemeStore();
  return (
    <div className={theme} >
      <QueryClientProvider client={queryClient}>
        <Toaster />

        <RouterProvider router={appRouter} />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  )
}

