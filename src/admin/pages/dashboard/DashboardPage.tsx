

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DoctorDashboard } from "@/admin/components/dashboard/DoctorDashboard"
import { ReceptionistDashboard } from "@/admin/components/dashboard/ReceptionistDashboard"
import { ManagerDashboard } from "@/admin/components/dashboard/ManagerDashboard"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("doctor")

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "doctor"
    setUserRole(role)
  }, [])

  const handleRoleChange = (role: string) => {
    localStorage.setItem("userRole", role)
    setUserRole(role)
  }

  return (
    <div className="space-y-6">
      {/* Role Selector for Demo */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">Vista de demostración:</p>
            <div className="flex gap-2">
              <Button
                variant={userRole === "doctor" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange("doctor")}
                className={
                  userRole === "doctor"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-card-foreground border-border"
                }
              >
                Doctor
              </Button>
              <Button
                variant={userRole === "receptionist" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange("receptionist")}
                className={
                  userRole === "receptionist"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-card-foreground border-border"
                }
              >
                Recepcionista
              </Button>
              <Button
                variant={userRole === "manager" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange("manager")}
                className={
                  userRole === "manager"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-card-foreground border-border"
                }
              >
                Gerente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Dashboard */}
      {userRole === "doctor" && <DoctorDashboard />}
      {userRole === "receptionist" && <ReceptionistDashboard />}
      {userRole === "manager" && <ManagerDashboard />}
    </div>
  )
}


