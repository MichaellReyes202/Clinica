import { useState } from "react"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FlaskConical,
  Receipt,
  UserCog,
  FileText,
  Settings,
  ChevronDown,
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
    title: "Pacientes",
    icon: Users,
    submenu: [
      { title: "Registrar Paciente", href: "/dashboard/patients/register/new", baseUrl: "/dashboard/patients/register" },
      { title: "Buscar Historial", href: "/dashboard/patients/search", baseUrl: "/dashboard/patients/search" },
    ],
  },
  {
    title: "Citas",
    icon: Calendar,
    submenu: [
      { title: "Agendar Cita", href: "/dashboard/appointments/schedule", baseUrl: "/dashboard/appointments/schedule" },
      { title: "Disponibilidad de Doctores", href: "/dashboard/appointments/availability", baseUrl: "/dashboard/appointments/availability" },
      { title: "Citas del Día", href: "/dashboard/appointments/today", baseUrl: "/dashboard/appointments/today" },
    ],
  },
  {
    title: "Consultas Médicas",
    icon: Stethoscope,
    submenu: [
      { title: "Crear Consulta", href: "/dashboard/consultations/create", baseUrl: "/dashboard/consultations/create" },
      { title: "Ingresar Notas", href: "/dashboard/consultations/notes", baseUrl: "/dashboard/consultations/notes" },
      { title: "Generar Receta", href: "/dashboard/consultations/prescription", baseUrl: "/dashboard/consultations/prescription" },
      { title: "Prescribir Exámenes", href: "/dashboard/consultations/exams", baseUrl: "/dashboard/consultations/exams" },
    ],
  },
  {
    title: "Laboratorio",
    icon: FlaskConical,
    submenu: [
      { title: "Registrar Resultados", href: "/dashboard/laboratory/results", baseUrl: "/dashboard/laboratory/results" },
      { title: "Historial de Exámenes", href: "/dashboard/laboratory/history", baseUrl: "/dashboard/laboratory/history" },
      { title: "Gestión de Exámenes", href: "/dashboard/laboratory/manage", baseUrl: "/dashboard/laboratory/manage" },
    ],
  },
  // {
  //   title: "Facturación y Caja",
  //   icon: Receipt,
  //   submenu: [
  //     { title: "Generar Factura", href: "/dashboard/billing/invoice", baseUrl: "/dashboard/billing/invoice" },
  //     { title: "Registrar Pagos", href: "/dashboard/billing/payments", baseUrl: "/dashboard/billing/payments" },
  //     { title: "Cierre de Caja", href: "/dashboard/billing/close", baseUrl: "/dashboard/billing/close" },
  //     { title: "Gestión de Promociones", href: "/dashboard/billing/promotions", baseUrl: "/dashboard/billing/promotions" },
  //   ],
  // },
  {
    title: "Recursos Humanos",
    icon: UserCog,
    submenu: [
      //      { title: "Control de Asistencia", href: "/dashboard/hr/attendance", baseUrl: "/dashboard/hr/attendance" },
      { title: "Gestión de Empleados", href: "/dashboard/hr/employees", baseUrl: "/dashboard/hr/employees" },
      { title: "Especialidades Médicas", href: "/dashboard/hr/specialties", baseUrl: "/dashboard/hr/specialties" },
      { title: "Cargos", href: "/dashboard/hr/position", baseUrl: "/dashboard/hr/position" },
    ],
  },
  {
    title: "Reportes",
    icon: FileText,
    submenu: [
      { title: "Reportes de Pacientes", href: "/dashboard/reports/patients", baseUrl: "/dashboard/reports/patients" },
      { title: "Reportes Financieros", href: "/dashboard/reports/financial", baseUrl: "/dashboard/reports/financial" },
      { title: "Reportes de Asistencia", href: "/dashboard/reports/attendance", baseUrl: "/dashboard/reports/attendance" },
    ],
  },
  {
    title: "Administración",
    icon: Settings,
    submenu: [
      { title: "Gestión de Usuarios y Roles", href: "/dashboard/admin/users", baseUrl: "/dashboard/admin/users" },
      { title: "Auditoría del Sistema", href: "/dashboard/admin/audit", baseUrl: "/dashboard/admin/audit" },
      { title: "Archivos Digitales", href: "/dashboard/admin/files", baseUrl: "/dashboard/admin/files" },
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

  // ✅ Inicializamos expandedItems con el menú que contiene la ruta actual
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const activeMenu = menuItems.find(
      (item) =>
        item.submenu &&
        item.submenu.some((sub) => pathname.startsWith(sub.baseUrl))
    )
    return activeMenu ? [activeMenu.title] : []
  })

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <>
      {/* Mobile toggle button */}
      <Button variant="ghost" size="icon" className="fixed top-5 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground" onClick={() => toggleCollapse()}>
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                          isCollapsed && "md:justify-center"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left text-sm">
                              {item.title}
                            </span>
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </>
                        )}
                      </button>
                      {expandedItems.includes(item.title) && !isCollapsed && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.href}>
                              <Link to={subitem.href}
                                className={cn(
                                  // "block px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors", pathname === subitem.href &&
                                  "block px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors", pathname.includes(subitem.baseUrl) &&
                                "bg-sidebar-primary text-sidebar-primary-foreground"
                                )}
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link to={item.href!}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                        pathname === item.href &&
                        "bg-sidebar-primary text-sidebar-primary-foreground",
                        isCollapsed && "md:justify-center"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
