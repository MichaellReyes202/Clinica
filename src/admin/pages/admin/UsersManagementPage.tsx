import React, { useState, useEffect, useMemo, Fragment } from "react"
import { useSearchParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { clinicaApi } from "@/api/clinicaApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {
  Search, Edit, KeyRound, Shield, Users, Loader2,
  ChevronDown, ChevronRight, Check, AlertCircle, Eye, X
} from "lucide-react"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useUsers } from "@/clinica/hooks/useUsers"
import { useRoles } from "@/clinica/hooks/useRoles"
import { useUserMutation } from "@/clinica/hooks/useEmployes"
import { CreateUserModal } from "@/admin/pages/admin/components/CreateUserModal"
import { AdminResetPasswordModal } from "@/admin/pages/admin/components/AdminResetPasswordModal"
import { CustomPagination } from "@/components/custom/CustomPagination"

// ─── Custom Switch ───────────────────────────────────────────────
const CustomSwitch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ease-in-out focus:outline-hidden items-center ${checked
        ? "bg-primary border-primary text-primary-foreground"
        : "bg-muted border-border text-muted-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-[21px]" : "translate-x-[1px]"
        }`}
    />
  </button>
)

// ─── Interfaces ──────────────────────────────────────────────────
interface SelectedUser { id: number; fullName: string }

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

// ─── Page Component ──────────────────────────────────────────────
export default function UsersManagementPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get("page") || "1"
  const queryParam = searchParams.get("query") || ""

  // Search / Filter state
  const [searchTerm, setSearchTerm] = useState(queryParam)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [viewFilter, setViewFilter] = useState<string>("all")

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<SelectedUser | null>(null)

  // Expanded users (accordion)
  const [expandedUsers, setExpandedUsers] = useState<number[]>([])

  const toggleUser = (userId: number) => {
    const isExpanded = expandedUsers.includes(userId)
    if (isExpanded) {
      setExpandedUsers((prev) => prev.filter((id) => id !== userId))
    } else {
      setExpandedUsers((prev) => [...prev, userId])
      fetchUserPermissions(userId)
    }
  }

  const handleExpandAll = () => {
    const allIds = filteredUsers.map((u) => u.id)
    setExpandedUsers(allIds)
    allIds.forEach((id) => {
      fetchUserPermissions(id)
    })
  }

  const handleCollapseAll = () => {
    setExpandedUsers([])
  }

  // Edit modal state
  const [editingUser, setEditingUser] = useState<{
    id: number
    fullName: string
    roles: string
  } | null>(null)
  const [editPermissions, setEditPermissions] = useState<number[]>([])
  const [originalPermissions, setOriginalPermissions] = useState<number[]>([])
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isLoadingEditPerms, setIsLoadingEditPerms] = useState(false)

  // Sync search param
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (debouncedSearchTerm) {
      newParams.set("query", debouncedSearchTerm)
    } else {
      newParams.delete("query")
    }
    newParams.set("page", "1")
    setSearchParams(newParams)
  }, [debouncedSearchTerm])

  // ─── Queries ─────────────────────────────────────────────────
  const { data: users, isLoading: isLoadingUsers } = useUsers()
  const { data: selectRoles, isLoading: isLoadingSelectRoles } = useRoles()
  const userMutation = useUserMutation()

  // Dynamic Roles
  const { data: rolesList, isLoading: isLoadingRolesList } = useQuery<RoleDto[]>({
    queryKey: ["permissions-roles-list"],
    queryFn: async () => {
      const { data } = await clinicaApi.get<RoleDto[]>("/roles")
      return data
    },
  })

  // All Views
  const { data: allPermissions, isLoading: isLoadingPermissions } = useQuery<ViewDto[]>({
    queryKey: ["permissions-views-list"],
    queryFn: async () => {
      const { data } = await clinicaApi.get<ViewDto[]>("/permissions")
      return data
    },
  })

  // All Role Permissions
  const { data: allRolesPermissions } = useQuery<Record<number, number[]>>({
    queryKey: ["all-roles-permissions", rolesList],
    queryFn: async () => {
      if (!rolesList || rolesList.length === 0) return {}
      const map: Record<number, number[]> = {}
      await Promise.all(
        rolesList.map(async (r) => {
          try {
            const { data } = await clinicaApi.get<number[]>(`/permissions/role/${r.id}`)
            map[r.id] = data
          } catch {
            map[r.id] = []
          }
        })
      )
      return map
    },
    enabled: !!rolesList && rolesList.length > 0,
  })

  // ─── User permissions cache ──────────────────────────────────
  const [userPermissionsCache, setUserPermissionsCache] = useState<Record<number, number[]>>({})
  const [loadingUserPerms, setLoadingUserPerms] = useState<Record<number, boolean>>({})

  const fetchUserPermissions = async (userId: number) => {
    if (userPermissionsCache[userId] !== undefined) return
    setLoadingUserPerms(prev => ({ ...prev, [userId]: true }))
    try {
      const { data } = await clinicaApi.get<number[]>(`/permissions/user/${userId}`)
      setUserPermissionsCache(prev => ({ ...prev, [userId]: data }))
    } catch {
      setUserPermissionsCache(prev => ({ ...prev, [userId]: [] }))
    } finally {
      setLoadingUserPerms(prev => ({ ...prev, [userId]: false }))
    }
  }

  // Auto-fetch visible users
  useEffect(() => {
    const list = users?.userListDto || []
    if (list.length === 0) return

    const fetchVisibleUsersPermissions = async () => {
      const usersToFetch = list.filter(u => userPermissionsCache[u.id] === undefined && !loadingUserPerms[u.id])
      if (usersToFetch.length === 0) return

      setLoadingUserPerms(prev => {
        const next = { ...prev }
        usersToFetch.forEach(u => { next[u.id] = true })
        return next
      })

      try {
        await Promise.all(
          usersToFetch.map(async (u) => {
            try {
              const { data } = await clinicaApi.get<number[]>(`/permissions/user/${u.id}`)
              setUserPermissionsCache(prev => ({ ...prev, [u.id]: data }))
            } catch {
              setUserPermissionsCache(prev => ({ ...prev, [u.id]: [] }))
            } finally {
              setLoadingUserPerms(prev => ({ ...prev, [u.id]: false }))
            }
          })
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchVisibleUsersPermissions()
  }, [users, userPermissionsCache])

  const getEffectivePermissions = (userRoles: string, userId: number): number[] => {
    const roleNames = userRoles.split(",").map((r) => r.trim())
    const rolePerms = new Set<number>()

    roleNames.forEach((roleName) => {
      const role = rolesList?.find((r) => r.name === roleName)
      if (role && allRolesPermissions?.[role.id]) {
        allRolesPermissions[role.id].forEach((vid) => rolePerms.add(vid))
      }
    })

    const userSpecific = userPermissionsCache[userId] || []
    userSpecific.forEach((vid) => rolePerms.add(vid))

    return Array.from(rolePerms)
  }

  const filteredUsers = useMemo(() => {
    let list = users?.userListDto || []

    if (roleFilter !== "all") {
      list = list.filter((u) => u.roles.split(",").map((r) => r.trim()).includes(roleFilter))
    }

    if (viewFilter !== "all" && allRolesPermissions && rolesList) {
      const viewId = parseInt(viewFilter, 10)
      list = list.filter((u) => {
        const effective = getEffectivePermissions(u.roles, u.id)
        return effective.includes(viewId)
      })
    }

    return list
  }, [users, roleFilter, viewFilter, allRolesPermissions, rolesList, userPermissionsCache])

  const groupPermissions = (permissions: ViewDto[]) => {
    const groups: Record<string, ViewDto[]> = {
      "Dashboard y Perfil": [], Pacientes: [], Citas: [], Consultas: [],
      Laboratorio: [], Facturación: [], "Recursos Humanos": [], Reportes: [], Administración: [],
    }

    permissions.forEach((p) => {
      if (p.name.startsWith("Dashboard") || p.name.startsWith("Perfil")) groups["Dashboard y Perfil"].push(p)
      else if (p.name.startsWith("Pacientes")) groups["Pacientes"].push(p)
      else if (p.name.startsWith("Citas")) groups["Citas"].push(p)
      else if (p.name.startsWith("Consultas")) groups["Consultas"].push(p)
      else if (p.name.startsWith("Laboratorio")) groups["Laboratorio"].push(p)
      else if (p.name.startsWith("Facturación")) groups["Facturación"].push(p)
      else if (p.name.startsWith("Recursos Humanos")) groups["Recursos Humanos"].push(p)
      else if (p.name.startsWith("Reportes")) groups["Reportes"].push(p)
      else if (p.name.startsWith("Administración")) groups["Administración"].push(p)
      else groups["Administración"].push(p)
    })

    return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0))
  }

  const groupedPermissions = allPermissions ? groupPermissions(allPermissions) : {}

  // Edit Handlers
  const handleOpenEditModal = async (user: { id: number; fullName: string; roles: string }) => {
    setEditingUser(user)
    setIsLoadingEditPerms(true)
    try {
      const { data } = await clinicaApi.get<number[]>(`/permissions/user/${user.id}`)
      setEditPermissions(data)
      setOriginalPermissions(data)
    } catch {
      setEditPermissions([])
      setOriginalPermissions([])
    } finally {
      setIsLoadingEditPerms(false)
    }
  }

  const handleCloseEditModal = () => {
    setEditingUser(null)
    setEditPermissions([])
    setOriginalPermissions([])
  }

  const handleToggleEditPermission = (viewId: number, checked: boolean) => {
    setEditPermissions((prev) => checked ? [...prev, viewId] : prev.filter((id) => id !== viewId))
  }

  const hasEditChanges = () => {
    if (editPermissions.length !== originalPermissions.length) return true
    const a = [...editPermissions].sort()
    const b = [...originalPermissions].sort()
    return a.some((val, i) => val !== b[i])
  }

  const handleSaveEditPermissions = async () => {
    if (!editingUser) return
    setIsSavingEdit(true)
    const toastId = toast.loading("Guardando permisos del usuario...")
    try {
      await clinicaApi.post("/permissions/assign", { userId: editingUser.id, viewIds: editPermissions })
      toast.success("¡Permisos personalizados actualizados!", { id: toastId })
      setUserPermissionsCache((prev) => ({ ...prev, [editingUser.id]: editPermissions }))
      handleCloseEditModal()
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error al guardar permisos", { id: toastId })
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Helpers
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-primary/10 text-primary border-primary/20",
      "bg-chart-1/10 text-chart-1 border-chart-1/20",
      "bg-chart-2/10 text-chart-2 border-chart-2/20",
      "bg-chart-3/10 text-chart-3 border-chart-3/20",
      "bg-chart-4/10 text-chart-4 border-chart-4/20",
      "bg-destructive/10 text-destructive border-destructive/20",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  if (isLoadingSelectRoles || isLoadingRolesList || isLoadingPermissions) {
    return <CustomFullScreenLoading />
  }

  const uniqueRoles = Array.from(new Set((users?.userListDto || []).flatMap((u) => u.roles.split(",").map((r) => r.trim())).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-2xs">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Visualice los accesos de cada usuario y personalice permisos individuales
          </p>
        </div>
      </div>

      {/* Toolbar: Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-3.5 rounded-2xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-card border-border pr-9 pl-3 h-9 text-sm rounded-lg shadow-2xs placeholder:text-muted-foreground/70 text-foreground" />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 text-xs w-44 bg-card border-border shadow-2xs rounded-lg">
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-muted-foreground" /><SelectValue placeholder="Filtrar por rol" /></div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {uniqueRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={viewFilter} onValueChange={setViewFilter}>
            <SelectTrigger className="h-9 text-xs w-52 bg-card border-border shadow-2xs rounded-lg">
              <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-muted-foreground" /><SelectValue placeholder="Filtrar por vista" /></div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las vistas</SelectItem>
              {(allPermissions || []).map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {(roleFilter !== "all" || viewFilter !== "all" || searchTerm !== "") && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setRoleFilter("all"); setViewFilter("all") }} className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer">
              <X className="h-3.5 w-3.5" /> Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3.5 rounded-2xl border border-border shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 bg-muted border border-border rounded-md px-2.5 py-1 text-muted-foreground text-[11px] font-semibold shadow-2xs">
            {isLoadingUsers ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : (
              `${filteredUsers.length} ${filteredUsers.length === 1 ? "usuario" : "usuarios"}`
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              className="h-8 rounded-lg text-foreground/85 text-xs font-semibold px-3 cursor-pointer"
            >
              Expandir todo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              className="h-8 rounded-lg text-foreground/85 text-xs font-semibold px-3 cursor-pointer"
            >
              Contraer todo
            </Button>
          </div>
        </div>
        <CreateUserModal isModalOpen={isCreateModalOpen} setIsModalOpen={setIsCreateModalOpen} availableRoles={selectRoles || []} createMutation={userMutation.createMutation} />
      </div>

      {resetTarget && (
        <AdminResetPasswordModal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} targetUserId={resetTarget.id} targetUserName={resetTarget.fullName} />
      )}

      {/* ─── Users Accordion (Retícula Grid Format) ─── */}
      <AnimatePresence mode="wait">
        {isLoadingUsers ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-2xs p-12 flex flex-col items-center justify-center min-h-[300px] w-full"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Cargando usuarios...</p>
                <p className="text-xs text-muted-foreground mt-0.5">Por favor, espere un momento</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="table-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden w-full"
          >
            <div className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full border-collapse text-sm bg-card text-card-foreground">
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td className="p-12 text-center text-muted-foreground italic bg-muted/10">
                        No se encontraron usuarios que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isExpanded = expandedUsers.includes(user.id)
                      const isLoadingPerms = loadingUserPerms[user.id] || false

                      const effectivePerms = getEffectivePermissions(user.roles, user.id)
                      const userActivePerms = (allPermissions || []).filter(p => effectivePerms.includes(p.id))
                      const userGroupedPerms = groupPermissions(userActivePerms)

                      return (
                        <Fragment key={user.id}>
                          {/* Fila del Usuario */}
                          <tr
                            onClick={() => toggleUser(user.id)}
                            className={`border-b border-border cursor-pointer hover:bg-muted/40 transition-colors select-none ${isExpanded ? "bg-muted/20" : "bg-card"}`}
                          >
                            <td className="p-3.5 z-10 border-r-0">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="text-muted-foreground shrink-0 pl-1">
                                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90 text-primary" : ""}`} />
                                  </div>
                                  <div className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarBgColor(user.fullName)}`} title={user.email}>
                                    {getInitials(user.fullName)}
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <span className="font-bold text-sm text-foreground truncate">
                                      {user.fullName}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                                      {user.roles.split(",").join(" • ")}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 pr-2" onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer" title="Editar permisos" onClick={() => handleOpenEditModal({ id: user.id, fullName: user.fullName, roles: user.roles })}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer" title="Restablecer contraseña" onClick={() => setResetTarget({ id: user.id, fullName: user.fullName })}>
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Contenido Expandido: Retícula (Grid) de Vistas */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              isLoadingPerms ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border bg-card">
                                  <td className="p-8 text-center text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                      <span className="text-xs font-medium">Cargando accesos habilitados...</span>
                                    </div>
                                  </td>
                                </motion.tr>
                              ) : Object.keys(userGroupedPerms).length === 0 ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border bg-card">
                                  <td className="p-6 text-center text-xs text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 inline mr-1 text-muted-foreground/60" />
                                    Este usuario no tiene acceso a ninguna vista.
                                  </td>
                                </motion.tr>
                              ) : (
                                <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-b border-border">
                                  <td className="p-0 border-t-0">
                                    <div className="w-full bg-muted/5 shadow-inner p-6 space-y-6">
                                      {Object.entries(userGroupedPerms).map(([category, list]) => (
                                        <div key={category} className="space-y-3">
                                          {/* Título de la Categoría */}
                                          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                            <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                              {category}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground bg-background border border-border/50 px-2 py-0.5 rounded-full shadow-xs">
                                              {list.length} {list.length === 1 ? 'permiso' : 'permisos'}
                                            </span>
                                          </div>

                                          {/* RETÍCULA (GRID) DE VISTAS */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {list.map((p) => (
                                              <div
                                                key={p.id}
                                                className="bg-card border border-border/60 rounded-xl p-3.5 shadow-xs hover:shadow-sm hover:border-primary/30 transition-all flex flex-col justify-center"
                                              >
                                                <span className="font-bold text-[13px] text-foreground block mb-1">
                                                  {p.name.includes("-") ? p.name.split("-")[1].trim() : p.name}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground leading-relaxed block line-clamp-2">
                                                  {p.description || "Sin descripción disponible."}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </motion.tr>
                              )
                            )}
                          </AnimatePresence>
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="pt-1">
        <CustomPagination totalPages={users?.pages || 0} />
      </div>

      {/* ─── Edit Permissions Modal ──────────────────────────────── */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && handleCloseEditModal()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-5 border-b border-border bg-card">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permisos Personalizados
            </DialogTitle>
            <DialogDescription className="mt-1">
              Configurando accesos para{" "}
              <strong className="text-foreground">{editingUser?.fullName}</strong>
              <Badge variant="outline" className="ml-2 text-[10px] uppercase font-bold tracking-wide bg-muted/50">
                {editingUser?.roles}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {isLoadingEditPerms ? (
            <div className="py-20 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Cargando matriz de permisos...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
              {Object.entries(groupedPermissions).map(([category, list]) => (
                <div key={category} className="mb-6">
                  <div className="py-2 mb-1 border-b border-border/50 flex items-center gap-2">
                    <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{category}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full">{list.length}</span>
                  </div>
                  <div className="space-y-1">
                    {list.map((permission) => {
                      const roleNames = editingUser?.roles.split(",").map((r) => r.trim()) || []
                      let isFromRole = false
                      roleNames.forEach((roleName) => {
                        const role = rolesList?.find((r) => r.name === roleName)
                        if (role && allRolesPermissions?.[role.id]?.includes(permission.id)) isFromRole = true
                      })

                      const isCustomChecked = editPermissions.includes(permission.id)
                      const isEffectivelyChecked = isFromRole || isCustomChecked

                      return (
                        <div key={permission.id} className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg transition-colors border border-transparent ${isFromRole ? "bg-muted/40 hover:bg-muted/60" : isCustomChecked ? "bg-primary/5 border-primary/10 hover:bg-primary/10" : "hover:bg-muted/30"}`}>
                          <div className="flex-1 min-w-0 flex items-center gap-2.5">
                            <span className={`text-sm font-medium ${isFromRole ? "text-muted-foreground" : "text-foreground"}`}>{permission.name}</span>
                            {isFromRole ? <Badge variant="secondary" className="text-[10px] h-5 px-1.5 py-0 font-semibold shadow-none opacity-80">Heredado del rol</Badge> : isCustomChecked ? <Badge className="bg-primary/15 text-primary hover:bg-primary/25 border-0 text-[10px] h-5 px-1.5 py-0 font-bold shadow-none">Personalizado</Badge> : null}
                          </div>
                          <CustomSwitch checked={isEffectivelyChecked} onChange={(val) => handleToggleEditPermission(permission.id, val)} disabled={isFromRole} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleCloseEditModal} className="h-9 text-xs rounded-lg cursor-pointer">Cancelar</Button>
            <Button onClick={handleSaveEditPermissions} disabled={isSavingEdit || !hasEditChanges()} className={`h-9 text-xs rounded-lg font-semibold px-5 transition-all duration-200 ${hasEditChanges() ? "bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-xs" : "bg-muted text-muted-foreground/45 cursor-not-allowed border-transparent"}`}>
              {isSavingEdit ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Guardando...</> : <><Check className="mr-1.5 h-3.5 w-3.5" /> Guardar cambios</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}