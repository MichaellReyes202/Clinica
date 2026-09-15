
import { Header } from "@/admin/components/Header"
import { Sidebar } from "@/admin/components/Sidebar"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Outlet, useLocation } from "react-router"

export const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === "/dashboard/chat";

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", isSidebarCollapsed ? "md:ml-16" : "md:ml-64")}>
        <Header />
        <main className={cn("flex-1 min-h-0 flex flex-col", isChatPage ? "p-0 overflow-hidden" : "overflow-y-auto p-6")}>
          <Outlet />
        </main>
      </div>
    </div >
  )
}

