import { useEffect } from "react";
import { ShieldAlert, LogOut, Info } from "lucide-react";
import { useAuthStore } from "@/auth/store/auth.store";
import { useNavigate } from "react-router";
import { getFirstAvailableRoute } from "@/components/routes/PermissionProtectedRoute";

export const NoAccessPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const navigate = useNavigate();

  const userViews = user?.permissions ?? user?.views ?? [];

  useEffect(() => {
    if (authStatus === "not-authenticated") {
      navigate("/auth/login", { replace: true });
    } else if (authStatus === "authenticated" && userViews.length > 0) {
      if (userViews.includes("Dashboard")) {
        navigate("/dashboard", { replace: true });
      } else {
        const targetPath = getFirstAvailableRoute(userViews);
        navigate(targetPath, { replace: true });
      }
    }
  }, [authStatus, userViews, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-black p-4 sm:p-6">

      <div className="w-full max-w-[380px] animate-in slide-in-from-bottom-4 fade-in duration-300">

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4 stroke-[1.5]" />
          <h1 className="text-[22px] font-semibold text-black dark:text-white tracking-tight">
            Acceso Restringido
          </h1>
        </div>

        {/* Bloque 1: Información */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden mb-6 shadow-sm border border-black/5 dark:border-white/10">
          <div className="p-4 border-b border-black/5 dark:border-white/10">
            <p className="text-[15px] text-zinc-900 dark:text-zinc-100 leading-normal">
              <span className="font-semibold">{user?.fullName || "Usuario"}</span>, tu cuenta ha sido verificada correctamente.
            </p>
          </div>
          <div className="p-4 flex items-start gap-3 bg-zinc-50/50 dark:bg-[#1C1C1E]">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Actualmente no tienes vistas asignadas. Comunícate con el administrador de la clínica para que habilite tu perfil.
            </p>
          </div>
        </div>

        {/* Bloque 2: Acción Destructiva */}
        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-[#1C1C1E] rounded-xl p-4 flex items-center justify-center gap-2 shadow-sm border border-black/5 dark:border-white/10 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          <span className="text-[16px] font-medium text-red-500">
            Cerrar Sesión
          </span>
        </button>

      </div>
    </div>
  );
};