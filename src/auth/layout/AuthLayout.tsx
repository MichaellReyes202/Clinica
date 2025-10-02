import { Outlet } from "react-router"



export const AuthLayout = () => {
  // return (
  //   <div className="min-h-screen flex items-center justify-center p-4  bg-muted">
  //     <Outlet />
  //   </div>
  // )

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Outlet />
      </div>
    </div>
  )


}
