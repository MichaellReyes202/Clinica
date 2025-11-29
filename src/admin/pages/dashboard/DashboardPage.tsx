

import { useAuthStore } from "@/auth/store/auth.store"
import { DoctorDashboard } from "@/admin/components/dashboard/DoctorDashboard"
import { ReceptionistDashboard } from "@/admin/components/dashboard/ReceptionistDashboard"
import { ManagerDashboard } from "@/admin/components/dashboard/ManagerDashboard"
import { Navigate } from "react-router"

export default function DashboardPage() {
    const user = useAuthStore(state => state.user);

    if (!user) {
        return <Navigate to="/auth/login" />
    }

    return (
        <div className="space-y-6">
            {/* Role-based Dashboard */}
            {user.roleId === 3 && <DoctorDashboard />}
            {user.roleId === 2 && <ReceptionistDashboard />}
            {user.roleId === 1 && <ManagerDashboard />}
            {/* Fallback for other roles or if no specific dashboard exists */}
            {![1, 2, 3].includes(user.roleId) && (
                <div className="p-4">
                    <h2 className="text-2xl font-bold">Bienvenido, {user.fullName}</h2>
                    <p className="text-muted-foreground">Seleccione una opción del menú para comenzar.</p>
                </div>
            )}
        </div>
    )
}


