
import { Link, useLocation, useNavigate } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
   Calendar, Clock, User, Phone, FileText, Edit, X, RefreshCw,
   Stethoscope, ArrowRight, CheckCircle,
   Check,
   Loader2,
   Play
} from "lucide-react"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useTodayAppointments, useUpdateAppointmentStatus } from "@/clinica/hooks/useAppointments"
import { StatsCard } from "@/admin/components/StatsCard"
import { useState } from "react"

// Badge Helper (Sin cambios mayores, solo estilos)
const getStatusBadge = (status: string) => {
   switch (status) {
      case "Programada":
         return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Programada</Badge>
      case "Confirmada":
         return <Badge className="bg-green-600 hover:bg-green-700">Confirmada / En Sala</Badge>
      case "En curso":
         return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse">En curso</Badge>
      case "Completada":
         return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Completada</Badge>
      case "Cancelada":
         return <Badge variant="destructive">Cancelada</Badge>
      default:
         return <Badge variant="outline">{status}</Badge>
   }
}

export const TodayAppointmentsPage = () => {
   const locationCurrent = useLocation();
   const { data: appointments = [], isLoading, isFetching, refetch } = useTodayAppointments();
   const { mutation, isPosting } = useUpdateAppointmentStatus();

   const [currentUpdatingId, setCurrentUpdatingId] = useState<number | null>(null);

   // Estadísticas rápidas
   const stats = {
      scheduled: appointments.filter(a => a.status === "Programada").length,
      confirmed: appointments.filter(a => a.status === "Confirmada").length,
      inProgress: appointments.filter(a => a.status === "En curso").length,
      completed: appointments.filter(a => a.status === "Completada").length
   }

   // 1	Programada
   // 2	Confirmada
   // 3	En curso
   // 4	Completada
   // 5	Cancelada
   // 6	Vencida

   const handleAttend = (appointmentId: number, status: number) => {
      mutation.mutate({ AppointmenId: appointmentId, StatusId: status }, {
         onSuccess: () => {
            refetch();
            setCurrentUpdatingId(appointmentId);
         }
      });
   }

   if (isLoading) return <CustomFullScreenLoading />

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="h-12 w-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary border border-sidebar-primary/20">
                  <Calendar className="h-6 w-6" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-foreground">Citas de Hoy</h2>
                  <p className="text-muted-foreground capitalize">
                     {new Date().toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
               </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="self-end md:self-auto">
               <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
               Actualizando
            </Button>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="En Sala de Espera" count={stats.confirmed} icon={User} color="text-green-600" bg="bg-green-100" />
            <StatsCard label="En Consulta" count={stats.inProgress} icon={Stethoscope} color="text-yellow-600" bg="bg-yellow-100" />
            <StatsCard label="Pendientes" count={stats.scheduled} icon={Clock} color="text-blue-600" bg="bg-blue-100" />
            <StatsCard label="Finalizadas" count={stats.completed} icon={CheckCircle} color="text-gray-600" bg="bg-gray-100" />
         </div>

         <Card className="border-border shadow-sm">
            <CardHeader>
               <CardTitle>Agenda del Día</CardTitle>
               <CardDescription>Pacientes programados para atención</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {appointments.length === 0 ? (
                     <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay citas programadas para hoy.</p>
                     </div>
                  ) : (
                     appointments.map((appt) => (
                        <div
                           key={appt.id} className={`
                                relative flex flex-col md:flex-row gap-2 p-4 rounded-xl border transition-all
                                ${appt.status === 'En curso' ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 ring-1 ring-yellow-200' : 'border-border bg-card hover:border-sidebar-border/80'}
                           `}
                        >
                           {/* Columna Izquierda: Hora */}
                           <div className="flex md:flex-col items-center md:justify-center gap-2 md:w-24 md:border-r md:border-border pr-4">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                              <span className="text-lg font-bold text-foreground">{appt.timeDisplay}</span>
                           </div>

                           {/* Columna Central: Datos Paciente */}
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between md:justify-start gap-3 flex-wrap">
                                 <h3 className="text-lg font-semibold text-foreground">{appt.patientFullName}</h3>
                                 {getStatusBadge(appt.status)}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                 <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{appt.doctorFullName}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{appt.patientPhone}</span>
                                 </div>
                                 <div className="flex items-start gap-2 sm:col-span-2">
                                    <FileText className="h-4 w-4 mt-0.5" />
                                    <span>{appt.reason || "Consulta General"}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Columna Derecha: Acciones */}
                           <div className="flex  md:flex-col  md:justify-center justify-end gap-2 md:mt-0 md:pl-4 md:border-l md:border-border min-w-[140px]">

                              {
                                 (appt.status == "Programada") && (
                                    <>
                                       <Button variant={"default"} className="w-full bg-sidebar-primary  text-white shadow-sm" onClick={() => handleAttend(appt.id, 2)}>
                                          {isPosting && appt.id === currentUpdatingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                          Confirmar
                                       </Button>
                                       <Button variant={"destructive"} className="w-full bg-sidebar-primary text-white shadow-sm" onClick={() => handleAttend(appt.id, 5)}>
                                          {isPosting && appt.id === currentUpdatingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                          Cancelar
                                       </Button>
                                    </>
                                 )
                              }
                              {
                                 // cuando la cita este confirmado se puede
                                 (appt.status == "Confirmada") && (
                                    // mover a esta ruta consultations/process/:appointmentId
                                    <>
                                       <Link to={`/dashboard/consultations/process/${appt.id}`} state={{ from: locationCurrent }}>
                                          <Button variant="outline" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                                             <Play className="h-4 w-4" />
                                             Iniciar Consulta
                                          </Button>
                                       </Link>
                                    </>
                                 )
                              }
                              {
                                 (appt.status == "En curso") && (
                                    <Link to={`/dashboard/consultations/process/${appt.id}`} state={{ from: locationCurrent }}>
                                       <Button variant="ghost" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                                          <Play className="h-4 w-4" />
                                          Retomar Consulta
                                       </Button>
                                    </Link>
                                 )
                              }
                              {/* Botones secundarios (solo si no está completada) */}
                              {/* {appt.status !== 'Completada' && appt.status !== 'Cancelada' && (
                                 <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-muted-foreground">
                                       <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                       <X className="h-4 w-4" />
                                    </Button>
                                 </div>
                              )} */}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   )
}


















// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Calendar, Clock, User, Phone, FileText, Edit, X, RefreshCw } from "lucide-react"
// import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
// import { useTodayAppointments } from "@/clinica/hooks/useAppointments"


// const getStatusBadge = (status: string) => {
//    switch (status) {
//       case "Programada":
//       case "Confirmada":
//          return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 border-blue-500/30">{status}</Badge>
//       case "En curso":
//          return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">En curso</Badge>
//       case "Completada":
//          return <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">Completada</Badge>
//       case "Cancelada":
//          return <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-red-500/30">Cancelada</Badge>
//       default:
//          return <Badge variant="secondary" className="bg-gray-500/20 text-gray-600 border-gray-500/30">{status}</Badge>
//    }
// }

// export const TodayAppointmentsPage = () => {
//    const { data: appointments = [], isLoading, isFetching, refetch } = useTodayAppointments()

//    const ScheduledCount = appointments.filter(a => a.status === "Programada" || a.status === "Confirmada").length
//    const InProgressCount = appointments.filter(a => a.status === "En curso").length
//    const CompletedCount = appointments.filter(a => a.status === "Completada").length
//    const CancelledCount = appointments.filter(a => a.status === "Cancelada").length

//    if (isLoading) return <CustomFullScreenLoading />

//    return (
//       <div className="space-y-6">
//          <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//                <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
//                   <Calendar className="h-5 w-5 text-chart-1" />
//                </div>
//                <div>
//                   <h2 className="text-2xl font-bold text-foreground">Citas del Día</h2>
//                   <p className="text-muted-foreground capitalize">
//                      {new Date().toLocaleDateString("es-NI", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//                   </p>
//                </div>
//             </div>
//             <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
//                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
//             </Button>
//          </div>

//          <div className="grid gap-4 md:grid-cols-4">
//             <Card className="bg-card border-border">
//                <CardContent className="pt-6">
//                   <div className="flex items-center justify-between">
//                      <div>
//                         <p className="text-sm text-muted-foreground">Pendientes</p>
//                         <p className="text-2xl font-bold text-card-foreground">{ScheduledCount}</p>
//                      </div>
//                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
//                         <Calendar className="h-6 w-6 text-blue-500" />
//                      </div>
//                   </div>
//                </CardContent>
//             </Card>

//             <Card className="bg-card border-border">
//                <CardContent className="pt-6">
//                   <div className="flex items-center justify-between">
//                      <div>
//                         <p className="text-sm text-muted-foreground">En curso</p>
//                         <p className="text-2xl font-bold text-card-foreground">{InProgressCount}</p>
//                      </div>
//                      <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
//                         <Clock className="h-6 w-6 text-yellow-500" />
//                      </div>
//                   </div>
//                </CardContent>
//             </Card>
//             <Card className="bg-card border-border">
//                <CardContent className="pt-6">
//                   <div className="flex items-center justify-between">
//                      <div>
//                         <p className="text-sm text-muted-foreground">Completadas</p>
//                         <p className="text-2xl font-bold text-card-foreground">{CompletedCount}</p>
//                      </div>
//                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
//                         <Calendar className="h-6 w-6 text-green-500" />
//                      </div>
//                   </div>
//                </CardContent>
//             </Card>
//             <Card className="bg-card border-border">
//                <CardContent className="pt-6">
//                   <div className="flex items-center justify-between">
//                      <div>
//                         <p className="text-sm text-muted-foreground">Canceladas</p>
//                         <p className="text-2xl font-bold text-card-foreground">{CancelledCount}</p>
//                      </div>
//                      <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
//                         <X className="h-6 w-6 text-red-500" />
//                      </div>
//                   </div>
//                </CardContent>
//             </Card>
//          </div>
//          <Card className="bg-card border-border">
//             <CardHeader>
//                <CardTitle className="text-card-foreground">Lista de Citas</CardTitle>
//                <CardDescription>Todas las citas programadas para hoy</CardDescription>
//             </CardHeader>
//             <CardContent>
//                <div className="space-y-4">
//                   {appointments.length === 0 ? (
//                      <p className="text-center text-muted-foreground py-8">No hay citas para hoy.</p>
//                   ) : (
//                      appointments.map((appointment) => (
//                         <div key={appointment.id} className="p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors">
//                            <div className="flex items-start justify-between gap-4">
//                               {/* ... El resto de tu diseño de tarjeta está bien ... */}
//                               <div className="flex items-start gap-4 flex-1">
//                                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
//                                     <Clock className="h-5 w-5 text-chart-1" />
//                                     {/* Ahora TimeDisplay vendrá correcto del backend */}
//                                     <span className="text-lg font-bold text-card-foreground">{appointment.timeDisplay}</span>
//                                  </div>

//                                  <div className="flex-1 space-y-2">
//                                     <div className="flex items-center gap-2 flex-wrap">
//                                        <h3 className="text-lg font-semibold text-card-foreground">{appointment.patientFullName}</h3>
//                                        {getStatusBadge(appointment.status)}
//                                     </div>
//                                     {/* ... Resto de detalles ... */}
//                                     <div className="grid gap-2 md:grid-cols-2">
//                                        <div className="flex items-center gap-2 text-sm">
//                                           <User className="h-4 w-4 text-muted-foreground" />
//                                           <span className="text-card-foreground">{appointment.doctorFullName}</span>
//                                        </div>
//                                        <div className="flex items-center gap-2 text-sm">
//                                           <Phone className="h-4 w-4 text-muted-foreground" />
//                                           <span className="text-card-foreground">{appointment.patientPhone}</span>
//                                        </div>
//                                     </div>
//                                     <div className="flex items-start gap-2 text-sm">
//                                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
//                                        <div>
//                                           <p className="text-muted-foreground text-xs">{appointment.specialtyName}</p>
//                                           <p className="text-card-foreground">{appointment.reason}</p>
//                                        </div>
//                                     </div>
//                                  </div>
//                               </div>

//                               {/* Botones de acción */}
//                               <div className="flex gap-2">
//                                  <Button variant="outline" size="icon" title="Reprogramar">
//                                     <Edit className="h-4 w-4" />
//                                  </Button>
//                                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" title="Cancelar">
//                                     <X className="h-4 w-4" />
//                                  </Button>
//                               </div>
//                            </div>
//                         </div>
//                      ))
//                   )}
//                </div>
//             </CardContent>
//          </Card>
//       </div>
//    )
// }

