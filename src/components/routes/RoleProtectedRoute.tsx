import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";

interface Props {
    allowedRoles: number[];
    children?: React.ReactNode;
}

export const RoleProtectedRoute = ({ allowedRoles, children }: Props) => {
    const authStatus = useAuthStore(state => state.authStatus);
    const hasRole = useAuthStore(state => state.hasRole);

    console.log("entro")
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

    if (!hasRole(allowedRoles)) {
        // Si está autenticado pero no tiene rol, redirigir a dashboard (si tiene acceso básico) o mostrar 403.
        // Como /dashboard es acceso global, redirigimos ahí si intenta entrar a algo restringido.
        // Pero si ya está en dashboard y no tiene acceso, podría ser un loop.
        // Asumimos que todos tienen acceso al menos a dashboard (rol 1,2,3,4,5).
        // Si el usuario tiene un rol que no está en allowedRoles, redirigir a /dashboard.
        return <Navigate to="/dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
