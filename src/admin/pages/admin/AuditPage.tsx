import { useSearchParams } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuditLog } from "@/clinica/hooks/useAuditLog"
import { ActionType, AuditModuletype, AuditStatus } from "@/interfaces/AuditLog.response"
import { CustomPagination } from "@/components/custom/CustomPagination"


export const AuditPage = () => {
   const [searchParams, setSearchParams] = useSearchParams()

   const searchTerm = searchParams.get("searchTerm") || ""
   const moduleName = searchParams.get("moduleName") || ""
   const statusName = searchParams.get("statusName") || ""

   const limit = searchParams.get('limit') || 10;
   const page = searchParams.get('page') || 1;

   const { data, isLoading } = useAuditLog({
      limit: limit || 10,
      offset: (Number(page) - 1) * Number(limit),
      searchTerm: searchTerm || null,
      moduleName: moduleName === "all" ? null : moduleName || null,
      statusName: statusName === "all" ? null : statusName || null,
   })
   const logs = data?.items || []

   // Helper to update params
   const updateParam = (key: string, value: string) => {
      const newParams = new URLSearchParams(searchParams)
      if (value && value !== "all") {
         newParams.set(key, value)
      } else {
         newParams.delete(key)
      }
      setSearchParams(newParams)
   }

   const getActionBadge = (action: ActionType) => {
      switch (action) {
         case ActionType.AUTH_DENIED: return <Badge variant="destructive">Denegado</Badge>
         case ActionType.LOGIN_SUCCESS: return <Badge variant="default">Login Exitoso</Badge>
         case ActionType.LOGIN_FAILURE: return <Badge variant="destructive">Login Fallido</Badge>
         case ActionType.LOGOUT: return <Badge variant="destructive">Logout</Badge>
         case ActionType.CREATE: return <Badge variant="secondary">Crear</Badge>
         case ActionType.UPDATE: return <Badge variant="destructive">Actualizar</Badge>
         case ActionType.DELETE: return <Badge variant="destructive">Eliminar</Badge>
         case ActionType.STATUS_CHANGE: return <Badge variant="destructive">Cambio de Estado</Badge>
         case ActionType.REPORT_GENERATED: return <Badge variant="destructive">Reporte Generado</Badge>
         default: return <Badge>{action}</Badge>
      }
   }
   const getStatusBadge = (status: AuditStatus) => {
      switch (status) {
         case AuditStatus.SUCCESS: return <Badge variant="secondary">Éxito</Badge>
         case AuditStatus.WARNING: return <Badge variant="default">Advertencia</Badge>
         case AuditStatus.ERROR: return <Badge variant="destructive">Error</Badge>
         case AuditStatus.FAILURE: return <Badge variant="destructive">Fallo</Badge>
         default: return <Badge>{status}</Badge>
      }
   }

   const getModuleName = (module: AuditModuletype) => {
      const entry = Object.entries(AuditModuletype).find(([_, value]) => value === module);
      return entry ? entry[0] : module;
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
               <Shield className="h-5 w-5 text-chart-1" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-foreground">Auditoría del Sistema</h2>
               <p className="text-muted-foreground">Registro de actividades y eventos del sistema</p>
            </div>
         </div>

         <div className="grid gap-4 md:grid-cols-4">
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Eventos Exitosos</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-chart-1">
                     {logs.filter((l) => l.status === AuditStatus.SUCCESS).length}
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Errores</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                     {logs.filter((l) => l.status === AuditStatus.ERROR || l.status === AuditStatus.FAILURE).length}
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {logs.filter((l) => l.status === AuditStatus.WARNING).length}
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Errores</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                     {logs.filter((l) => l.status === AuditStatus.FAILURE).length}
                  </div>
               </CardContent>
            </Card>


         </div>

         <Card>
            <CardHeader>
               <CardTitle>Registro de Auditoría</CardTitle>
               <CardDescription>Historial de actividades del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-2 flex-wrap flex-col md:flex-row">
                  <div className="grow">
                     <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Buscar en registros..."
                           value={searchTerm}
                           onChange={(e) => updateParam("searchTerm", e.target.value)}
                           className="pl-9"
                        />
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <div>
                        <Select value={moduleName} onValueChange={(val) => updateParam("moduleName", val)}>
                           <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Todos los módulos" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos los módulos</SelectItem>
                              <SelectItem value="Users">Usuarios</SelectItem>
                              <SelectItem value="Patients">Pacientes</SelectItem>
                              <SelectItem value="Appointments">Citas</SelectItem>
                              <SelectItem value="System">Sistema</SelectItem>
                              <SelectItem value="Employees">Empleados</SelectItem>
                              <SelectItem value="Specialties">Especialidades</SelectItem>
                              <SelectItem value="ExamTypes">Tipos de examen</SelectItem>
                              <SelectItem value="Positions">Cargos</SelectItem>
                              <SelectItem value="Roles">Roles</SelectItem>
                              <SelectItem value="Auth">Autenticación</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div>
                        <Select value={statusName} onValueChange={(val) => updateParam("statusName", val)}>
                           <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Todos los estados" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos los estados</SelectItem>
                              <SelectItem value="SUCCESS">Éxito</SelectItem>
                              <SelectItem value="ERROR">Error</SelectItem>
                              <SelectItem value="WARNING">Advertencia</SelectItem>
                              <SelectItem value="FAILURE">Fallo</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>

               <div className="rounded-md border">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Usuario</TableHead>
                           <TableHead>Acción</TableHead>
                           <TableHead>Detalle</TableHead>
                           <TableHead>Módulo</TableHead>
                           <TableHead>Fecha y Hora</TableHead>
                           <TableHead>Estado</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {isLoading ? (
                           <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                 <div className="flex justify-center items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando registros...
                                 </div>
                              </TableCell>
                           </TableRow>
                        ) : logs.length > 0 ? (
                           logs.map((log) => (
                              <TableRow key={log.id}>
                                 <TableCell className="font-medium">
                                    <div className="flex flex-col"><span>{log.userEmail}</span></div>
                                 </TableCell>
                                 <TableCell>{getActionBadge(log.actionType)}</TableCell>
                                 <TableCell>{log.changeDetail || log.recordDisplay || "N/A"}</TableCell>
                                 <TableCell>{getModuleName(log.module)}</TableCell>
                                 <TableCell>{new Date(log.createdAtLocal).toLocaleString()}</TableCell>
                                 <TableCell>{getStatusBadge(log.status)}</TableCell>
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                 No se encontraron resultados.
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </CardContent>
         </Card>

         <CustomPagination totalPages={data?.pages || 0} />


      </div>
   )
}
