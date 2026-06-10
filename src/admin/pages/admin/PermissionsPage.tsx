import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { clinicaApi } from "@/api/clinicaApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { toast } from "sonner"
import { Shield, Search, Check, Loader2 } from "lucide-react"

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

export function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  // 1. Obtener lista de usuarios
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

  // 3. Obtener permisos asignados al usuario seleccionado
  const { data: userPermissionIds, isLoading: isLoadingUserPermissions } = useQuery({
    queryKey: ["user-assigned-permissions", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return []
      const { data } = await clinicaApi.get<number[]>(`/permissions/user/${selectedUserId}`)
      return data
    },
    enabled: !!selectedUserId
  })

  // Sincronizar permisos del usuario seleccionado a nuestro estado local
  useEffect(() => {
    if (userPermissionIds) {
      setSelectedPermissionIds(userPermissionIds)
    }
  }, [userPermissionIds])

  // 4. Mutación para guardar permisos
  const saveMutation = useMutation({
    mutationFn: async (payload: { userId: number; viewIds: number[] }) => {
      const { data } = await clinicaApi.post("/permissions/assign", payload)
      return data
    },
    onSuccess: () => {
      toast.success("Permisos actualizados correctamente")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error al actualizar permisos")
    }
  })

  const handleSelectUser = (user: UserListDto) => {
    setSelectedUserId(user.id)
    setSelectedUser(user)
  }

  const handleTogglePermission = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds(prev => [...prev, permissionId])
    } else {
      setSelectedPermissionIds(prev => prev.filter(id => id !== permissionId))
    }
  }

  const handleSelectAll = () => {
    if (!allPermissions) return
    setSelectedPermissionIds(allPermissions.map(p => p.id))
  }

  const handleClearAll = () => {
    setSelectedPermissionIds([])
  }

  const handleSave = () => {
    if (!selectedUserId) return
    saveMutation.mutate({
      userId: selectedUserId,
      viewIds: selectedPermissionIds
    })
  }

  // Filtrado de usuarios en frontend
  const filteredUsers = (users || []).filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Agrupación de permisos para renderizado estructurado
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
      "Administración": [],
      "Otros": []
    }

    permissions.forEach((p) => {
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
        groups["Otros"].push(p)
      }
    })

    return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0))
  }

  const groupedPermissions = allPermissions ? groupPermissions(allPermissions) : {}

  if (isLoadingUsers || isLoadingPermissions) {
    return <CustomFullScreenLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Permisos</h2>
          <p className="text-muted-foreground">Administre el acceso dinámico de los usuarios a las vistas de la clínica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda: Lista de Usuarios */}
        <Card className="md:col-span-1 h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Usuarios</CardTitle>
            <CardDescription>Seleccione un usuario para editar permisos</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-4 space-y-1">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">No se encontraron usuarios.</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedUserId === u.id
                      ? "bg-sidebar-primary/10 border-sidebar-primary text-sidebar-primary font-medium"
                      : "hover:bg-accent border-transparent"
                  }`}
                >
                  <div className="text-sm font-semibold">{u.fullName}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="text-[10px] mt-1 inline-block bg-accent px-1.5 py-0.5 rounded text-foreground font-mono">
                    {u.roles}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Columna derecha: Gestión de Permisos */}
        <div className="md:col-span-2 h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-6">
          {!selectedUser ? (
            <Card className="h-full flex flex-col justify-center items-center p-8 text-center">
              <Shield className="h-16 w-16 text-muted-foreground/35 mb-4 stroke-[1.2]" />
              <CardTitle className="text-muted-foreground text-xl">Sin usuario seleccionado</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Seleccione un usuario de la lista de la izquierda para comenzar a configurar sus accesos de vista.
              </CardDescription>
            </Card>
          ) : (
            <>
              {/* Encabezado del usuario seleccionado */}
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-chart-1 uppercase tracking-wider">Usuario Seleccionado</span>
                      <CardTitle className="text-xl mt-1">{selectedUser.fullName}</CardTitle>
                      <CardDescription className="mt-1">{selectedUser.email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        Marcar Todos
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClearAll}>
                        Limpiar
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Grid de Permisos por Categorías */}
              {isLoadingUserPermissions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(groupedPermissions).map(([category, list]) => (
                    <Card key={category} className="shadow-sm">
                      <CardHeader className="pb-2 bg-muted/20">
                        <CardTitle className="text-sm font-semibold">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-3 space-y-3">
                        {list.map((permission) => (
                          <div key={permission.id} className="flex items-start gap-2.5">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={selectedPermissionIds.includes(permission.id)}
                              onCheckedChange={(checked) =>
                                handleTogglePermission(permission.id, checked === true)
                              }
                            />
                            <div className="grid gap-0.5 leading-none">
                              <Label
                                htmlFor={`perm-${permission.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {permission.name}
                              </Label>
                              {permission.description && (
                                <span className="text-[11px] text-muted-foreground">
                                  {permission.description}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
