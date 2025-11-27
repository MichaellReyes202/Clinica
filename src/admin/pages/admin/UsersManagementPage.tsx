import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Settings } from "lucide-react"

import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
// Importación del nuevo componente

import { useUsers } from "@/clinica/hooks/useUsers"
import { useRoles } from "@/clinica/hooks/useRoles"
import { useUserMutation } from "@/clinica/hooks/useEmployes"
import { CreateUserModal } from "@/admin/pages/admin/components/CreateUserModal"


export default function UsersManagementPage() {

   const [searchTerm, setSearchTerm] = useState("") // termino de busqueda para los empleados 
   const [isModalOpen, setIsModalOpen] = useState(false);
   const { data: users, isLoading: isLoadingUsers } = useUsers()
   const { data: roles, isLoading: isLoadingRoles } = useRoles()

   const userMutation = useUserMutation();
   const filteredUsers = useMemo(() => {
      if (!users?.userListDto) return [];
      return users.userListDto.filter(
         (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
   }, [users, searchTerm]);

   if (isLoadingUsers || isLoadingRoles) {
      return <CustomFullScreenLoading />;
   }

   const getRoleBadge = (roles: string) => {
      const roleMap: Record<string, { label: string; variant: any }> = {
         Admin: { label: "Admin", variant: "destructive" },
         Doctor: { label: "Doctor", variant: "default" },
         Recepcionista: { label: "Recepcionista", variant: "secondary" },
         Gerente: { label: "Gerente", variant: "default" },
      }
      const primaryRole = roles.split(',')[0].trim();
      const roleInfo = roleMap[primaryRole] || { label: primaryRole, variant: "secondary" }
      return <Badge variant={roleInfo.variant}>{roles}</Badge>
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
               <Settings className="h-5 w-5 text-chart-1" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios y Roles</h2>
               <p className="text-muted-foreground">Administre usuarios y permisos del sistema</p>
            </div>
         </div>

         <Card>
            <CardHeader>
               <CardTitle>Usuarios del Sistema</CardTitle>
               <CardDescription>Lista de usuarios con acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                     />
                  </div>

                  {/* Componente Modal de Creación de Usuario */}
                  <CreateUserModal
                     isModalOpen={isModalOpen}
                     setIsModalOpen={setIsModalOpen}
                     availableRoles={roles || []}
                     createMutation={userMutation.createMutation}
                  />
               </div>

               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>UserId</TableHead>
                        <TableHead>EmpleadoId</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Cedula</TableHead>
                        <TableHead>Ultimo Login</TableHead>
                        <TableHead>Fecha de Creacion</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Acciones</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                           <TableCell className="font-medium">{user.id}</TableCell>
                           <TableCell>{user.employerId}</TableCell>
                           <TableCell>{user.fullName}</TableCell>
                           <TableCell>{user.email}</TableCell>
                           <TableCell>
                              <Badge variant={user.isActive ? "secondary" : "destructive"}>
                                 {user.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                           </TableCell>
                           <TableCell>{user.dni}</TableCell>
                           <TableCell>{user.lastLogin}</TableCell>
                           <TableCell>{user.createdAt}</TableCell>
                           <TableCell>{getRoleBadge(user.roles)}</TableCell>
                           <TableCell>
                              <div className="flex gap-2">
                                 <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                 </Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   )
}