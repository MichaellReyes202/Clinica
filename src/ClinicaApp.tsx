import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"
import { Toaster } from 'sonner';


const queryClient = new QueryClient();
export const ClinicaApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />

      <RouterProvider router={appRouter} />

      {/* The rest of your application */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

