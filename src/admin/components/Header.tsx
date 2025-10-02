

import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";

export function Header() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario")
  const [userRole, setUserRole] = useState("doctor")

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Usuario"
    const role = localStorage.getItem("userRole") || "doctor"
    setUserName(name)
    setUserRole(role)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    navigate('/login');
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      doctor: "Doctor",
      receptionist: "Recepcionista",
      manager: "Gerente",
      admin: "Administrador",
    }
    return roles[role] || role
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-card-foreground">Sistema de Gestión Clínica</h1>
          <p className="text-sm text-muted-foreground">Oficentro Masaya</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-card-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sidebar-primary" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-card-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuLabel className="text-popover-foreground">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-accent">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
