import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";

interface Props {
  requiredPermission: string;
  children?: React.ReactNode;
}

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

  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
