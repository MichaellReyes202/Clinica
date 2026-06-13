import React, { useState, useEffect, Fragment } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { clinicaApi } from "@/api/clinicaApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { toast } from "sonner"
import { Shield, Search, Check, Loader2, ChevronDown, ChevronUp, ChevronRight, Plus, X, Users, AlertCircle, MoreHorizontal, Eye, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"

// Switch personalizado de alto contraste con el diseño exacto de la imagen
const CustomSwitch = ({
  checked,
  onChange,
  disabled
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-slate-200 transition-colors duration-200 ease-in-out focus:outline-hidden items-center ${checked ? "bg-[#a2e105] border-[#a2e105]" : "bg-slate-200 dark:bg-slate-800 dark:border-slate-700"
        } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-[21px]" : "translate-x-[1px]"
          }`}
      />
    </button>
  )
}

interface UserListDto {
  id: number
  email: string
  fullName: string
  roles: string
}

interface UserResponse {
  count: number
  pages: number
  userListDto: UserListDto[]
}

interface ViewDto {
  id: number
  name: string
  route: string
  description?: string
}

interface RoleDto {
  id: number
  name: string
  description?: string
}

export function PermissionsPage() {
  const queryClient = useQueryClient()
  const [permissionSearch, setPermissionSearch] = useState("")
  // Local changes states
  const [localRolePermissions, setLocalRolePermissions] = useState<Record<number, number[]>>({})

  // New role creation state
  const [isNewRolePopoverOpen, setIsNewRolePopoverOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Dashboard y Perfil": true,
    "Pacientes": true,
    "Citas": true,
    "Consultas": true,
    "Laboratorio": true,
    "Facturación": true,
    "Recursos Humanos": true,
    "Reportes": true,
    "Administración": true
  })

  // 1. Obtener todos los usuarios
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["permissions-users-list"],
    queryFn: async () => {
      const { data } = await clinicaApi.get<UserResponse>("/users", {
        params: { limit: 100, offset: 0 }
      })
      return data.userListDto
    }
  })

  // 2. Obtener lista de todos los permisos disponibles (vistas)
  const { data: allPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions-views-list"],
    queryFn: async () => {
      const { data } = await clinicaApi.get<ViewDto[]>("/permissions")
      return data
    }
  })

  // 3. Obtener los roles dinámicos del backend
  const { data: roles, isLoading: isLoadingRoles } = useQuery<RoleDto[]>({
    queryKey: ["permissions-roles-list"],
    queryFn: async () => {
      const { data } = await clinicaApi.get<RoleDto[]>("/roles")
      return data
    }
  })

  // 4. Obtener permisos de todos los roles en paralelo
  const { data: allRolesPermissions, isLoading: isLoadingAllRolesPermissions } = useQuery({
    queryKey: ["all-roles-permissions", roles],
    queryFn: async () => {
      if (!roles || roles.length === 0) return {}
      const permissionsMap: Record<number, number[]> = {}

      await Promise.all(
        roles.map(async (r) => {
          try {
            const { data } = await clinicaApi.get<number[]>(`/permissions/role/${r.id}`)
            permissionsMap[r.id] = data
          } catch (e) {
            permissionsMap[r.id] = []
          }
        })
      )
      return permissionsMap
    },
    enabled: !!roles && roles.length > 0
  })

  // Sincronizar permisos del servidor al estado local inicial
  useEffect(() => {
    if (allRolesPermissions) {
      setLocalRolePermissions(JSON.parse(JSON.stringify(allRolesPermissions)))
    }
  }, [allRolesPermissions])

  // Helpers de Avatares e Iniciales
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
      "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
      "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
      "bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50",
      "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50",
      "bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50",
      "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50",
      "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900/50"
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Renderizar burbujas apiladas de usuarios por rol de forma dinámica por nombre de rol
  const renderAvatarStack = (roleName: string) => {
    const roleUsers = users?.filter(u => u.roles?.split(',').map(r => r.trim()).includes(roleName)) || []
    const limit = 3
    const shownUsers = roleUsers.slice(0, limit)
    const remaining = roleUsers.length - limit

    return (
      <div className="flex -space-x-1.5 items-center justify-center">
        {shownUsers.map(u => {
          const initials = getInitials(u.fullName)
          const bgClass = getAvatarBgColor(u.fullName)
          return (
            <div
              key={u.id}
              className={`inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 ${bgClass} text-[10px] flex items-center justify-center font-bold font-sans cursor-pointer transition-transform hover:scale-110`}
              title={`${u.fullName} (${u.email})`}
            >
              {initials}
            </div>
          )
        })}
        {remaining > 0 && (
          <div
            className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold"
            title={`${remaining} más`}
          >
            +{remaining}
          </div>
        )}
        {roleUsers.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Sin usuarios</span>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center h-7 w-7 rounded-full border border-border bg-card hover:bg-muted shadow-2xs ml-2 transition-colors cursor-pointer">
              <Plus className="h-4 w-4 text-blue-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 rounded-xl shadow-lg border border-border bg-popover text-popover-foreground">
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Miembros ({roleUsers.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {roleUsers.map(u => (
                  <div key={u.id} className="flex flex-col p-1.5 rounded hover:bg-accent text-xs">
                    <span className="font-medium text-foreground">{u.fullName}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{u.email}</span>
                  </div>
                ))}
                {roleUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-2 text-center">No hay usuarios asignados.</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Toggle de permiso para un Rol
  const isRolePermissionActive = (roleId: number, viewId: number) => {
    return (localRolePermissions[roleId] || []).includes(viewId)
  }

  const handleToggleRolePermission = (roleId: number, viewId: number, checked: boolean) => {
    setLocalRolePermissions(prev => {
      const rolePerms = prev[roleId] || []
      const updatedPerms = checked
        ? [...rolePerms, viewId]
        : rolePerms.filter(id => id !== viewId)
      return {
        ...prev,
        [roleId]: updatedPerms
      }
    })
  }

  // Toggle de permiso para un usuario individual
  const isUserPermissionActive = (userId: number, viewId: number) => {
    return (localUserPermissions[userId] || []).includes(viewId)
  }

  const handleToggleUserPermission = (userId: number, viewId: number, checked: boolean) => {
    setLocalUserPermissions(prev => {
      const userPerms = prev[userId] || []
      const updatedPerms = checked
        ? [...userPerms, viewId]
        : userPerms.filter(id => id !== viewId)
      return {
        ...prev,
        [userId]: updatedPerms
      }
    })
  }



  // Expandir / Colapsar secciones
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleToggleAllSections = (expand: boolean) => {
    const updated: Record<string, boolean> = {}
    Object.keys(expandedSections).forEach(k => {
      updated[k] = expand
    })
    setExpandedSections(updated)
  }

  // Crear nuevo rol
  const handleCreateRole = async () => {
    if (newRoleName.trim().length < 4) {
      toast.error("El nombre del rol debe tener al menos 4 caracteres")
      return
    }
    setIsCreatingRole(true)
    const toastId = toast.loading("Creando rol...")
    try {
      await clinicaApi.post("/roles", {
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || `Rol ${newRoleName.trim()}`
      })
      toast.success("¡Rol creado correctamente!", { id: toastId })
      setNewRoleName("")
      setNewRoleDescription("")
      setIsNewRolePopoverOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["permissions-roles-list"] })
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Ocurrió un error al crear el rol", { id: toastId })
    } finally {
      setIsCreatingRole(false)
    }
  }

  // Guardar cambios masivos comparando local vs original
  const [isSaving, setIsSaving] = useState(false)

  const hasUnsavedChanges = () => {
    return (roles || []).some(r => {
      const original = allRolesPermissions?.[r.id] || []
      const current = localRolePermissions[r.id] || []
      if (original.length !== current.length) return true
      const sortedOriginal = [...original].sort()
      const sortedCurrent = [...current].sort()
      return sortedOriginal.some((val, i) => val !== sortedCurrent[i])
    })
  }

  const handleDiscardChanges = () => {
    if (allRolesPermissions) {
      setLocalRolePermissions(JSON.parse(JSON.stringify(allRolesPermissions)))
      toast.info("Cambios descartados")
    }
  }

  const handleSaveAllChanges = async () => {
    const rolesWithChanges = (roles || []).filter(r => {
      const original = allRolesPermissions?.[r.id] || []
      const current = localRolePermissions[r.id] || []
      if (original.length !== current.length) return true
      const sortedOriginal = [...original].sort()
      const sortedCurrent = [...current].sort()
      return sortedOriginal.some((val, i) => val !== sortedCurrent[i])
    })

    if (rolesWithChanges.length === 0) {
      toast.info("No hay cambios que guardar")
      return
    }

    setIsSaving(true)
    const toastId = toast.loading("Guardando cambios en el servidor...")

    try {
      // 1. Guardar cambios en roles
      if (rolesWithChanges.length > 0) {
        await Promise.all(
          rolesWithChanges.map(r =>
            clinicaApi.post("/permissions/role/assign", {
              roleId: r.id,
              viewIds: localRolePermissions[r.id] || []
            })
          )
        )
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["all-roles-permissions"] })
      ])

      toast.success("¡Permisos actualizados correctamente!", { id: toastId })
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Ocurrió un error al guardar los permisos", { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  // Agrupamiento y filtrado de vistas
  const groupPermissions = (permissions: ViewDto[]) => {
    const groups: Record<string, ViewDto[]> = {
      "Dashboard y Perfil": [],
      "Pacientes": [],
      "Citas": [],
      "Consultas": [],
      "Laboratorio": [],
      "Facturación": [],
      "Recursos Humanos": [],
      "Reportes": [],
      "Administración": []
    }

    // Filtrar por término de búsqueda si existe
    const filtered = permissions.filter(p =>
      p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(permissionSearch.toLowerCase()))
    )

    filtered.forEach((p) => {
      if (p.name.startsWith("Dashboard") || p.name.startsWith("Perfil")) {
        groups["Dashboard y Perfil"].push(p)
      } else if (p.name.startsWith("Pacientes")) {
        groups["Pacientes"].push(p)
      } else if (p.name.startsWith("Citas")) {
        groups["Citas"].push(p)
      } else if (p.name.startsWith("Consultas")) {
        groups["Consultas"].push(p)
      } else if (p.name.startsWith("Laboratorio")) {
        groups["Laboratorio"].push(p)
      } else if (p.name.startsWith("Facturación")) {
        groups["Facturación"].push(p)
      } else if (p.name.startsWith("Recursos Humanos")) {
        groups["Recursos Humanos"].push(p)
      } else if (p.name.startsWith("Reportes")) {
        groups["Reportes"].push(p)
      } else if (p.name.startsWith("Administración")) {
        groups["Administración"].push(p)
      } else {
        groups["Administración"].push(p)
      }
    })

    return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0))
  }

  const groupedPermissions = allPermissions ? groupPermissions(allPermissions) : {}

  if (isLoadingUsers || isLoadingRoles || isLoadingPermissions || isLoadingAllRolesPermissions) {
    return <CustomFullScreenLoading />
  }

  return (
    <div className="space-y-6">
      {/* Header Sección */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-2xs">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Permisos de acceso</h2>
            <p className="text-sm text-muted-foreground">Configura las vistas del sistema para cada rol y empleado de la clínica</p>
          </div>
        </div>

        {/* Controles de Búsqueda */}
        <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
          {/* Input de Búsqueda de Vistas */}
          <div className="relative w-64">
            <Input
              placeholder="Buscar vista..."
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              className="bg-card border-border pr-9 pl-3 h-9 text-sm rounded-lg shadow-2xs placeholder:text-muted-foreground/70 text-foreground"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Barra de Herramientas de Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3.5 rounded-2xl border border-border shadow-2xs">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleToggleAllSections(true)} className="h-8.5 rounded-lg text-foreground/85 text-xs font-semibold">
            Expandir todo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleToggleAllSections(false)} className="h-8.5 rounded-lg text-foreground/85 text-xs font-semibold">
            Contraer todo
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges() && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs border border-border font-semibold shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                Cambios sin guardar
              </motion.div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="h-8.5 rounded-lg text-foreground/85 text-xs font-semibold px-4 cursor-pointer"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
              </Button>
            </>
          )}

          <Button
            size="sm"
            onClick={handleSaveAllChanges}
            disabled={isSaving || !hasUnsavedChanges()}
            className={`shadow-xs h-8.5 rounded-lg text-white font-semibold text-xs px-4 transition-all duration-200 ${hasUnsavedChanges()
              ? "bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.02] cursor-pointer"
              : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full border-collapse text-sm bg-card text-card-foreground">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="p-4 text-left min-w-[320px] sticky left-0 bg-card z-20 border-r border-border">
                  <div className="flex flex-col space-y-2">
                    <div className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                      Roles del Sistema
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-1 bg-muted border border-border rounded-md px-2 py-1 text-muted-foreground text-[11px] font-semibold shadow-2xs">
                        <span>{(roles?.length || 0)} roles</span>
                      </div>
                    </div>
                  </div>
                </th>

                {/* Columnas de Roles Dinámicos */}
                {roles?.map(role => (
                  <th key={role.id} className="p-4 text-center font-medium min-w-[160px] border-l border-border bg-card relative">
                    <div className="absolute top-2 right-2 text-muted-foreground/50 hover:text-foreground cursor-pointer p-0.5 rounded hover:bg-muted transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                    <div className="space-y-2.5 mt-1">
                      <div className="text-xs text-card-foreground/95 uppercase font-bold tracking-wider">
                        {role.name}
                      </div>
                      {renderAvatarStack(role.name)}
                    </div>
                  </th>
                ))}



                {/* Columna para Agregar Nuevo Rol */}
                <th className="p-4 text-center min-w-[80px] border-l border-border bg-card">
                  <div className="flex items-center justify-center">
                    <Popover open={isNewRolePopoverOpen} onOpenChange={setIsNewRolePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center justify-center h-8 w-8 rounded-full border border-border bg-card hover:bg-muted shadow-2xs cursor-pointer transition-all hover:scale-105" title="Crear nuevo rol">
                          <Plus className="h-4.5 w-4.5 text-muted-foreground/60" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3.5 rounded-xl shadow-xl border bg-popover text-popover-foreground z-50">
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Crear nuevo rol
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Nombre del Rol (Ej: Analista)"
                              className="h-8 text-xs bg-muted/30 border-border text-foreground"
                              value={newRoleName}
                              onChange={(e) => setNewRoleName(e.target.value)}
                            />
                            <Input
                              placeholder="Descripción del Rol"
                              className="h-8 text-xs bg-muted/30 border-border text-foreground"
                              value={newRoleDescription}
                              onChange={(e) => setNewRoleDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5"
                              onClick={() => {
                                setIsNewRolePopoverOpen(false)
                                setNewRoleName("")
                                setNewRoleDescription("")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isCreatingRole || newRoleName.trim().length < 4}
                              onClick={handleCreateRole}
                            >
                              {isCreatingRole ? "Creando..." : "Crear"}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Cuerpo de la Matriz */}
            <tbody>
              {Object.entries(groupedPermissions).map(([category, list]) => (
                <Fragment key={category}>
                  <tr
                    onClick={() => toggleSection(category)}
                    className="border-b border-border bg-muted/60 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                  >
                    <td
                      colSpan={2 + (roles?.length || 0)}
                      className="p-3.5 sticky left-0 bg-muted/60 z-10 border-r border-border shadow-[1px_0_3px_rgba(0,0,0,0.01)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground">
                          {expandedSections[category] ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="font-bold text-[12px] text-foreground uppercase tracking-wider">{category}</span>
                        <span className="text-[10px] lowercase font-normal bg-background/50 text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {list.length} {list.length === 1 ? 'permiso' : 'permisos'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {expandedSections[category] && list.map((permission) => (
                      <motion.tr
                        key={permission.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-border hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-3.5 sticky left-0 bg-card z-10 border-r border-border min-w-[320px] shadow-[1px_0_3px_rgba(0,0,0,0.01)]">
                          <div className="flex flex-col pr-2">
                            <span className="font-semibold text-card-foreground text-sm">
                              {permission.name}
                            </span>
                            {permission.description && (
                              <span className="text-[11px] text-muted-foreground font-normal leading-relaxed mt-0.5">
                                {permission.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Switches de Roles Dinámicos */}
                        {roles?.map(role => (
                          <td key={role.id} className="p-3 text-center border-l border-border/50 bg-card">
                            <div className="flex justify-center items-center">
                              <CustomSwitch
                                checked={isRolePermissionActive(role.id, permission.id)}
                                onChange={(checked) =>
                                  handleToggleRolePermission(role.id, permission.id, checked)
                                }
                              />
                            </div>
                          </td>
                        ))}



                        {/* Celda vacía para la columna de Nuevo Rol */}
                        <td className="p-3 text-center border-l border-border/50 bg-card">
                          {/* Vacío como la columna plus de la imagen */}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </Fragment>
              ))}

              {Object.keys(groupedPermissions).length === 0 && (
                <tr>
                  <td
                    colSpan={2 + (roles?.length || 0)}
                    className="p-8 text-center text-muted-foreground italic bg-muted/10"
                  >
                    No se encontraron vistas que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  )
}
