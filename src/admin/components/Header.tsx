

import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Moon, Sun, User } from "lucide-react"
import { useAuthStore } from "@/auth/store/auth.store";
import { useThemeStore } from "@/store/theme.store";

export function Header() {
    const { user, logout } = useAuthStore();
    const { isDark, toggleIsDark } = useThemeStore();
    return (
        <header className="sticky top-0 z-30 border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="ml-8 md:ml-1">
                    <h1 className="text-xl font-semibold text-card-foreground">Sistema de Gestión Clínica</h1>
                    <p className="text-sm text-muted-foreground">Oficentro Masaya</p>
                </div>

                {/* {isCollapsed ? <ChevronRight className="h-7 w-7 font-bold" /> : <ChevronLeft className="h-7 w-7 font-bold" />} */}

                <div className="flex items-center gap-4">
                    {/* <Button variant="ghost" size="icon" className="relative text-card-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sidebar-primary" />
          </Button> */}

                    {/* Theme Toggle */}
                    <Button variant="ghost" size="icon" className="text-card-foreground" onClick={() => toggleIsDark()}>
                        {isDark() ? <Sun className="h-9 w-9" /> : <Moon className="h-9 w-9" />}
                    </Button>

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                                        {user?.fullName[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium text-card-foreground">{user?.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{user?.roles[0]}</p>
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
                            <DropdownMenuItem onClick={() => logout()} className="text-destructive hover:bg-accent">
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
