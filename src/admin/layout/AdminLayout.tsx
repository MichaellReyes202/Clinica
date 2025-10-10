
import { Header } from "@/admin/components/Header"
import { Sidebar } from "@/admin/components/Sidebar"
import { cn } from "@/lib/utils"
import { useState } from "react"

// import type React from "react"
import { Outlet } from "react-router"



// export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
export const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div className={cn("flex-1 flex flex-col ", isSidebarCollapsed ? "md:ml-15" : "md:ml-64")}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div >
  )
}

