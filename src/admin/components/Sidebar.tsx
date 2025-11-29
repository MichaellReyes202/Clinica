

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

import { useAuthStore } from "@/auth/store/auth.store"



interface MenuItem {
    title: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
    allowedRoles?: number[]
    submenu?: { title: string; href: string, baseUrl: string, allowedRoles?: number[] }[]
}



const menuItems: MenuItem[] = [

    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        allowedRoles: [1, 2, 3, 4, 5]

    },

    {

        title: "Citas",
        icon: Calendar,
        allowedRoles: [1, 2, 3], // Admin, Recepción, Médico (para ver agenda)
        submenu: [
            { title: "Mi Agenda", href: "/dashboard/appointments/today", baseUrl: "/dashboard/appointments/today", allowedRoles: [3] },
            { title: "Agendar Cita", href: "/dashboard/appointments/schedule", baseUrl: "/dashboard/appointments/schedule", allowedRoles: [1, 2] },
            { title: "Disponibilidad", href: "/dashboard/appointments/availability", baseUrl: "/dashboard/appointments/availability", allowedRoles: [1, 2] },
        ],
    },
    {
        title: "Pacientes",
        icon: Users,
        allowedRoles: [1, 2, 3, 4, 5],
        submenu: [
            { title: "Buscar Paciente", href: "/dashboard/patients/search", baseUrl: "/dashboard/patients/search", allowedRoles: [1, 2, 3, 4, 5] },
            { title: "Registrar Nuevo", href: "/dashboard/patients/register/new", baseUrl: "/dashboard/patients/register", allowedRoles: [1, 2] },
        ],
    },

    {
        title: "Consultas",
        icon: Stethoscope,
        allowedRoles: [3],
        submenu: [
            // Esta opción es para emergencias o pacientes sin cita previa
            { title: "Consulta", href: "/dashboard/consultations/create", baseUrl: "/dashboard/consultations/create", allowedRoles: [3] },
            { title: "Historial de Consultas", href: "/dashboard/consultations/history", baseUrl: "/dashboard/consultations/history", allowedRoles: [3] },
        ],
    },
    {
        title: "Laboratorio",
        icon: FlaskConical,
        allowedRoles: [1, 5],
        submenu: [
            { title: "Registrar Resultados", href: "/dashboard/laboratory/results", baseUrl: "/dashboard/laboratory/results", allowedRoles: [1, 5] },
            { title: "Historial Exámenes", href: "/dashboard/laboratory/history", baseUrl: "/dashboard/laboratory/history", allowedRoles: [1, 5] },
            { title: "Catálogo Exámenes", href: "/dashboard/laboratory/manage", baseUrl: "/dashboard/laboratory/manage", allowedRoles: [1, 5] },
        ],
    },
    {
        title: "Recursos Humanos",
        icon: UserCog,
        allowedRoles: [1],
        submenu: [
            { title: "Empleados", href: "/dashboard/hr/employees", baseUrl: "/dashboard/hr/employees", allowedRoles: [1] },
            // { title: "Asistencia", href: "/dashboard/hr/attendance", baseUrl: "/dashboard/hr/attendance" },
            { title: "Especialidades", href: "/dashboard/hr/specialties", baseUrl: "/dashboard/hr/specialties", allowedRoles: [1] },
            { title: "Cargos", href: "/dashboard/hr/position", baseUrl: "/dashboard/hr/position", allowedRoles: [1] },
        ],

    },
    {
        title: "Reportes",
        icon: FileText,
        href: "/dashboard/reports",
        allowedRoles: [1, 4]
    },

    // {
    //     title: "Reportes",
    //     icon: FileText,
    //     allowedRoles: [1],
    //     submenu: [
    //         { title: "Pacientes", href: "/dashboard/reports/patients", baseUrl: "/dashboard/reports/patients", allowedRoles: [1] },
    //         { title: "Asistencia", href: "/dashboard/reports/attendance", baseUrl: "/dashboard/reports/attendance", allowedRoles: [1] },
    //         { title: "Financiero", href: "/dashboard/reports/financial", baseUrl: "/dashboard/reports/financial", allowedRoles: [1] },
    //     ],
    // },

    {

        title: "Administración",
        icon: Settings,
        allowedRoles: [1],
        submenu: [
            { title: "Usuarios", href: "/dashboard/admin/users", baseUrl: "/dashboard/admin/users", allowedRoles: [1] },
            { title: "Auditoría", href: "/dashboard/admin/audit", baseUrl: "/dashboard/admin/audit", allowedRoles: [1] },
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

    const hasRole = useAuthStore(state => state.hasRole);



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



    // Filtrar items según roles

    const filteredMenuItems = menuItems.map(item => {

        // 1. Verificar si el usuario tiene rol para el item padre

        if (item.allowedRoles && !hasRole(item.allowedRoles)) return null;



        // 2. Si tiene submenu, filtrar los hijos

        if (item.submenu) {

            const filteredSubmenu = item.submenu.filter(sub => !sub.allowedRoles || hasRole(sub.allowedRoles));

            // Si después de filtrar no quedan hijos, no mostrar el padre

            if (filteredSubmenu.length === 0) return null;

            return { ...item, submenu: filteredSubmenu };

        }



        return item;

    }).filter(item => item !== null) as MenuItem[];





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

                        {filteredMenuItems.map((item) => (

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











// import { useState, useEffect } from "react"
// import { cn } from "@/lib/utils"
// import {
//     LayoutDashboard, Users, Calendar, Stethoscope, ChevronDown,
//     ChevronRight,
//     Menu,
//     X,
//     ChevronLeft,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Link, useLocation } from "react-router"
// import { useAuthStore } from "@/auth/store/auth.store"

// interface MenuItem {
//     title: string
//     icon: React.ComponentType<{ className?: string }>
//     href?: string
//     allowedRoles?: number[]
//     submenu?: { title: string; href: string, baseUrl: string, allowedRoles?: number[] }[]
// }

// const menuItems: MenuItem[] = [
//     {
//         title: "Dashboard",
//         icon: LayoutDashboard,
//         href: "/dashboard",
//         allowedRoles: [1, 2, 3, 4, 5]
//     },
//     {
//         title: "Citas",
//         icon: Calendar,
//         allowedRoles: [1, 2, 3], // Admin, Recepción, Médico (para ver agenda)
//         submenu: [
//             { title: "Mi Agenda", href: "/dashboard/appointments/today", baseUrl: "/dashboard/appointments/today", allowedRoles: [3] },
//             { title: "Agendar Cita", href: "/dashboard/appointments/schedule", baseUrl: "/dashboard/appointments/schedule", allowedRoles: [1, 2] },
//             { title: "Disponibilidad", href: "/dashboard/appointments/availability", baseUrl: "/dashboard/appointments/availability", allowedRoles: [1, 2] },
//         ],
//     },
//     {
//         title: "Pacientes",
//         icon: Users,
//         allowedRoles: [1, 2, 3, 4, 5],
//         submenu: [
//             { title: "Buscar Paciente", href: "/dashboard/patients/search", baseUrl: "/dashboard/patients/search", allowedRoles: [1, 2, 3, 4, 5] },
//             { title: "Registrar Nuevo", href: "/dashboard/patients/register/new", baseUrl: "/dashboard/patients/register", allowedRoles: [1, 2] },
//         ],
//     },
//     {
//         title: "Consultas",
//         icon: Stethoscope,
//         allowedRoles: [3],
//         submenu: [
//             // Esta opción es para emergencias o pacientes sin cita previa
//             { title: "Consulta", href: "/dashboard/consultations/create", baseUrl: "/dashboard/consultations/create", allowedRoles: [3] },
//             { title: "Historial de Consultas", href: "/dashboard/consultations/history", baseUrl: "/dashboard/consultations/history", allowedRoles: [3] },
//         ],
//     },
// ]

// interface SidebarProps {
//     isCollapsed: boolean;
//     toggleCollapse: () => void;
// }

// export const Sidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
//     const location = useLocation()
//     const pathname = location.pathname
//     const hasRole = useAuthStore(state => state.hasRole);

//     const [expandedItems, setExpandedItems] = useState<string[]>([])

//     useEffect(() => {
//         const activeMenu = menuItems.find(
//             (item) =>
//                 item.submenu &&
//                 item.submenu.some((sub) => pathname.startsWith(sub.baseUrl))
//         )
//         if (activeMenu) {
//             setExpandedItems(prev => {
//                 if (!prev.includes(activeMenu.title)) return [...prev, activeMenu.title];
//                 return prev;
//             })
//         }
//     }, [pathname])

//     const toggleExpanded = (title: string) => {
//         setExpandedItems((prev) =>
//             prev.includes(title)
//                 ? prev.filter((item) => item !== title)
//                 : [...prev, title]
//         )
//     }

//     // Filtrar items según roles
//     const filteredMenuItems = menuItems.map(item => {
//         // 1. Verificar si el usuario tiene rol para el item padre
//         if (item.allowedRoles && !hasRole(item.allowedRoles)) return null;

//         // 2. Si tiene submenu, filtrar los hijos
//         if (item.submenu) {
//             const filteredSubmenu = item.submenu.filter(sub => !sub.allowedRoles || hasRole(sub.allowedRoles));
//             // Si después de filtrar no quedan hijos, no mostrar el padre
//             if (filteredSubmenu.length === 0) return null;
//             return { ...item, submenu: filteredSubmenu };
//         }

//         return item;
//     }).filter(item => item !== null) as MenuItem[];


//     return (
//         <>
//             <Button variant="ghost" size="icon" className="fixed top-5 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground border border-border" onClick={() => toggleCollapse()}>
//                 {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
//             </Button>

//             <aside
//                 className={cn(
//                     "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden",
//                     isCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "w-64"
//                 )}
//             >
//                 <div className="flex flex-col h-full">
//                     <div className="py-7 border-b border-sidebar-border flex justify-around md:py-4">
//                         <h2 className={cn("font-bold text-sidebar-foreground transition-opacity self-center", isCollapsed ? "md:opacity-0 md:hidden" : "opacity-100")}>
//                             Oficentro Masaya
//                         </h2>
//                         <div className="p-2 border-sidebar-border hidden md:block">
//                             <Button variant="ghost" size="sm" onClick={() => toggleCollapse()} className="text-sidebar-foreground hover:bg-sidebar-accent">
//                                 {isCollapsed ? (<ChevronRight className="h-7 w-7 font-bold" />) : (<ChevronLeft className="h-7 w-7 font-bold" />)}
//                             </Button>
//                         </div>
//                     </div>

//                     <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
//                         {filteredMenuItems.map((item) => (
//                             <div key={item.title}>
//                                 {item.submenu ? (
//                                     <>
//                                         <button
//                                             onClick={() => toggleExpanded(item.title)}
//                                             className={cn(
//                                                 "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
//                                                 isCollapsed && "justify-center px-2"
//                                             )}
//                                             title={isCollapsed ? item.title : undefined}
//                                         >
//                                             <item.icon className="h-5 w-5 shrink-0" />
//                                             {!isCollapsed && (
//                                                 <>
//                                                     <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
//                                                     {expandedItems.includes(item.title) ? (
//                                                         <ChevronDown className="h-4 w-4 shrink-0" />
//                                                     ) : (
//                                                         <ChevronRight className="h-4 w-4 shrink-0" />
//                                                     )}
//                                                 </>
//                                             )}
//                                         </button>

//                                         <div className={cn(
//                                             "overflow-hidden transition-all duration-300 ease-in-out",
//                                             expandedItems.includes(item.title) && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//                                         )}>
//                                             <ul className="ml-4 mt-1 pl-3 border-l border-sidebar-border space-y-1">
//                                                 {item.submenu.map((subitem) => (
//                                                     <li key={subitem.href}>
//                                                         <Link
//                                                             to={subitem.href}
//                                                             className={cn(
//                                                                 "block px-3 py-2 rounded-md text-sm transition-colors",
//                                                                 pathname === subitem.href || pathname.startsWith(subitem.baseUrl)
//                                                                     ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
//                                                                     : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
//                                                             )}
//                                                         >
//                                                             {subitem.title}
//                                                         </Link>
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <Link
//                                         to={item.href!}
//                                         className={cn(
//                                             "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
//                                             pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
//                                             isCollapsed && "justify-center px-2"
//                                         )}
//                                         title={isCollapsed ? item.title : undefined}
//                                     >
//                                         <item.icon className="h-5 w-5 shrink-0" />
//                                         {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
//                                     </Link>
//                                 )}
//                             </div>
//                         ))}
//                     </nav>
//                 </div>
//             </aside>
//         </>
//     )
// }



