import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";

interface Props {
  requiredPermission: string;
  children?: React.ReactNode;
}

export const getFirstAvailableRoute = (permissions: string[]): string => {
  if (permissions.includes("Dashboard")) return "/dashboard";
  if (permissions.includes("Citas - Hoy")) return "/dashboard/appointments/today";
  if (permissions.includes("Citas - Agendar")) return "/dashboard/appointments/schedule";
  if (permissions.includes("Citas - Disponibilidad")) return "/dashboard/appointments/availability";
  if (permissions.includes("Pacientes - Buscar")) return "/dashboard/patients/search";
  if (permissions.includes("Pacientes - Registrar")) return "/dashboard/patients/register/new";
  if (permissions.includes("Consultas - Crear")) return "/dashboard/consultations/create";
  if (permissions.includes("Consultas - Historial")) return "/dashboard/consultations/history";
  if (permissions.includes("Laboratorio - Registrar Resultados")) return "/dashboard/laboratory/results";
  if (permissions.includes("Laboratorio - Historial")) return "/dashboard/laboratory/history";
  if (permissions.includes("Laboratorio - Catálogo de Exámenes")) return "/dashboard/laboratory/manage";
  
  // Facturación
  if (permissions.includes("Facturación - Factura")) return "/dashboard/billing/invoice";
  if (permissions.includes("Facturación - Pagos")) return "/dashboard/billing/payments";
  if (permissions.includes("Facturación - Cierre de caja")) return "/dashboard/billing/close";
  if (permissions.includes("Facturación - Promociones")) return "/dashboard/billing/promotions";

  // Recursos Humanos
  if (permissions.includes("Recursos Humanos - Empleados")) return "/dashboard/hr/employees";
  if (permissions.includes("Recursos Humanos - Asistencia")) return "/dashboard/hr/attendance";
  if (permissions.includes("Recursos Humanos - Especialidades")) return "/dashboard/hr/specialties";
  if (permissions.includes("Recursos Humanos - Cargos")) return "/dashboard/hr/position";
  
  // Reportes
  if (permissions.includes("Reportes")) return "/dashboard/reports";
  
  // Administración
  if (permissions.includes("Administración - Usuarios")) return "/dashboard/admin/users";
  if (permissions.includes("Administración - Horarios")) return "/dashboard/admin/schedules";
  if (permissions.includes("Administración - Auditoría")) return "/dashboard/admin/audit";
  if (permissions.includes("Administración - Archivos Digitales")) return "/dashboard/admin/files";
  
  return "/auth/no-access";
};

export const PermissionProtectedRoute = ({ requiredPermission, children }: Props) => {
  const authStatus = useAuthStore(state => state.authStatus);
  const hasPermission = useAuthStore(state => state.hasPermission);
  const user = useAuthStore(state => state.user);

  if (authStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'not-authenticated') {
    return <Navigate to="/auth/login" />;
  }

  if (user?.requiresPasswordChange) {
    return <Navigate to="/auth/change-password" replace />;
  }

  const userViews = user?.permissions ?? user?.views ?? [];

  // Si no tiene ninguna vista, redirigir a la pantalla de sin acceso
  if (userViews.length === 0) {
    return <Navigate to="/auth/no-access" replace />;
  }

  // Si es el layout del Dashboard, permitir si tiene al menos un permiso en el sistema
  if (requiredPermission === "DashboardLayout") {
    return children ? <>{children}</> : <Outlet />;
  }

  // Si entra al Home del Dashboard pero no tiene el permiso "Dashboard"
  if (requiredPermission === "Dashboard" && !hasPermission("Dashboard")) {
    const targetPath = getFirstAvailableRoute(userViews);
    return <Navigate to={targetPath} replace />;
  }

  // Si entra a una sección específica para la que no tiene permisos
  if (requiredPermission && requiredPermission !== "DashboardLayout" && !hasPermission(requiredPermission)) {
    const targetPath = hasPermission("Dashboard") ? "/dashboard" : getFirstAvailableRoute(userViews);
    return <Navigate to={targetPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
