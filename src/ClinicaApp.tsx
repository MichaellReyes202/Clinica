import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"


export const ClinicaApp = () => {
  return (
    <RouterProvider router={appRouter} />
  )
}

