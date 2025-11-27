

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
   LayoutDashboard, Users, Calendar, Stethoscope, FlaskConical, UserCog, FileText, Settings, ChevronDown,
   ChevronRight,
   Menu,
   X,
   ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router"

interface MenuItem {
   title: string
   icon: React.ComponentType<{ className?: string }>
   href?: string
   submenu?: { title: string; href: string, baseUrl: string }[]
}

const menuItems: MenuItem[] = [
   {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
   },
   {
      title: "Citas",
      icon: Calendar,
      submenu: [
         { title: "Citas del Día", href: "/dashboard/appointments/today", baseUrl: "/dashboard/appointments/today" },
         { title: "Agendar Cita", href: "/dashboard/appointments/schedule", baseUrl: "/dashboard/appointments/schedule" },
         { title: "Disponibilidad", href: "/dashboard/appointments/availability", baseUrl: "/dashboard/appointments/availability" },
      ],
   },
   {
      title: "Pacientes",
      icon: Users,
      submenu: [
         { title: "Buscar Paciente", href: "/dashboard/patients/search", baseUrl: "/dashboard/patients/search" },
         { title: "Registrar Nuevo", href: "/dashboard/patients/register/new", baseUrl: "/dashboard/patients/register" },
      ],
   },
   {
      title: "Consultas",
      icon: Stethoscope,
      submenu: [
         // Esta opción es para emergencias o pacientes sin cita previa
         { title: "Consulta", href: "/dashboard/consultations/create", baseUrl: "/dashboard/consultations/create" },
         // Un acceso directo a historiales podría ser útil aquí o dentro de Pacientes
      ],
   },
   {
      title: "Laboratorio",
      icon: FlaskConical,
      submenu: [
         { title: "Registrar Resultados", href: "/dashboard/laboratory/results", baseUrl: "/dashboard/laboratory/results" },
         { title: "Historial Exámenes", href: "/dashboard/laboratory/history", baseUrl: "/dashboard/laboratory/history" },
         { title: "Catálogo Exámenes", href: "/dashboard/laboratory/manage", baseUrl: "/dashboard/laboratory/manage" },
      ],
   },
   {
      title: "Recursos Humanos",
      icon: UserCog,
      submenu: [
         { title: "Empleados", href: "/dashboard/hr/employees", baseUrl: "/dashboard/hr/employees" },
         { title: "Asistencia", href: "/dashboard/hr/attendance", baseUrl: "/dashboard/hr/attendance" },
         { title: "Especialidades", href: "/dashboard/hr/specialties", baseUrl: "/dashboard/hr/specialties" },
         { title: "Cargos", href: "/dashboard/hr/position", baseUrl: "/dashboard/hr/position" },
      ],
   },
   {
      title: "Reportes",
      icon: FileText,
      submenu: [
         { title: "Pacientes", href: "/dashboard/reports/patients", baseUrl: "/dashboard/reports/patients" },
         { title: "Asistencia", href: "/dashboard/reports/attendance", baseUrl: "/dashboard/reports/attendance" },
      ],
   },
   {
      title: "Administración",
      icon: Settings,
      submenu: [
         { title: "Usuarios", href: "/dashboard/admin/users", baseUrl: "/dashboard/admin/users" },
         { title: "Auditoría", href: "/dashboard/admin/audit", baseUrl: "/dashboard/admin/audit" },
         // { title: "Archivos", href: "/dashboard/admin/files", baseUrl: "/dashboard/admin/files" },
      ],
   },
]

interface SidebarProps {
   isCollapsed: boolean
   toggleCollapse: () => void
}

export const Sidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
   const location = useLocation()
   const pathname = location.pathname

   const [expandedItems, setExpandedItems] = useState<string[]>([])

   useEffect(() => {
      const activeMenu = menuItems.find(
         (item) =>
            item.submenu &&
            item.submenu.some((sub) => pathname.startsWith(sub.baseUrl))
      )
      if (activeMenu) {
         setExpandedItems(prev => {
            if (!prev.includes(activeMenu.title)) return [...prev, activeMenu.title];
            return prev;
         })
      }
   }, [pathname])

   const toggleExpanded = (title: string) => {
      setExpandedItems((prev) =>
         prev.includes(title)
            ? prev.filter((item) => item !== title)
            : [...prev, title]
      )
   }

   return (
      <>
         <Button variant="ghost" size="icon" className="fixed top-5 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground border border-border" onClick={() => toggleCollapse()}>
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
         </Button>

         <aside
            className={cn(
               "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden",
               isCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "w-64"
            )}
         >
            <div className="flex flex-col h-full">
               <div className="py-7 border-b border-sidebar-border flex justify-around md:py-4">
                  <h2 className={cn("font-bold text-sidebar-foreground transition-opacity self-center", isCollapsed ? "md:opacity-0 md:hidden" : "opacity-100")}>
                     Oficentro Masaya
                  </h2>
                  <div className="p-2 border-sidebar-border hidden md:block">
                     <Button variant="ghost" size="sm" onClick={() => toggleCollapse()} className="text-sidebar-foreground hover:bg-sidebar-accent">
                        {isCollapsed ? (<ChevronRight className="h-7 w-7 font-bold" />) : (<ChevronLeft className="h-7 w-7 font-bold" />)}
                     </Button>
                  </div>
               </div>

               <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {menuItems.map((item) => (
                     <div key={item.title}>
                        {item.submenu ? (
                           <>
                              <button
                                 onClick={() => toggleExpanded(item.title)}
                                 className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                                    isCollapsed && "justify-center px-2"
                                 )}
                                 title={isCollapsed ? item.title : undefined}
                              >
                                 <item.icon className="h-5 w-5 shrink-0" />
                                 {!isCollapsed && (
                                    <>
                                       <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                                       {expandedItems.includes(item.title) ? (
                                          <ChevronDown className="h-4 w-4 shrink-0" />
                                       ) : (
                                          <ChevronRight className="h-4 w-4 shrink-0" />
                                       )}
                                    </>
                                 )}
                              </button>

                              <div className={cn(
                                 "overflow-hidden transition-all duration-300 ease-in-out",
                                 expandedItems.includes(item.title) && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                              )}>
                                 <ul className="ml-4 mt-1 pl-3 border-l border-sidebar-border space-y-1">
                                    {item.submenu.map((subitem) => (
                                       <li key={subitem.href}>
                                          <Link
                                             to={subitem.href}
                                             className={cn(
                                                "block px-3 py-2 rounded-md text-sm transition-colors",
                                                pathname === subitem.href || pathname.startsWith(subitem.baseUrl)
                                                   ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                                                   : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                             )}
                                          >
                                             {subitem.title}
                                          </Link>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </>
                        ) : (
                           <Link
                              to={item.href!}
                              className={cn(
                                 "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                                 pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                                 isCollapsed && "justify-center px-2"
                              )}
                              title={isCollapsed ? item.title : undefined}
                           >
                              <item.icon className="h-5 w-5 shrink-0" />
                              {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                           </Link>
                        )}
                     </div>
                  ))}
               </nav>
            </div>
         </aside>
      </>
   )
}



