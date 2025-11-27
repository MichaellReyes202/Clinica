

// DoctorAvailabilityPage.tsx → TU DISEÑO ORIGINAL + TODO FUNCIONANDO PERFECTO
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, RefreshCw } from "lucide-react";
import { useSpecialties } from "@/clinica/hooks/useSpecialties";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";
import { formatDate } from "date-fns";

export const DoctorAvailabilityPage = () => {
   const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

   const { data: specialties, isLoading: loadingSpecialties } = useSpecialties();
   const { data: doctorAvailability = [], isLoading, isFetching, refetch } = useDoctorsAvailability(selectedSpecialty === "all" ? null : selectedSpecialty);

   const today = new Date().getDay();
   const isSunday = today === 0;

   if (isLoading || loadingSpecialties) {
      return <CustomFullScreenLoading />;
   }

   if (isSunday) {
      return (
         <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-chart-1" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-foreground">Disponibilidad de Doctores</h2>
                  <p className="text-muted-foreground">Estado actual de disponibilidad del personal médico</p>
               </div>
            </div>
            <div className="flex flex-col items-center justify-center py-16">
               <div className="bg-muted/50 rounded-xl p-8 max-w-md text-center">
                  <div className="text-6xl mb-4">Closed</div>
                  <h3 className="text-xl font-semibold text-muted-foreground">Cerrado los domingos</h3>
                  <p className="text-sm text-muted-foreground mt-2">Volveremos el lunes a las 8:00 AM</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-chart-1" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-foreground">Disponibilidad de Doctores</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                     Estado actual de disponibilidad del personal médico
                     {isFetching && (
                        <span className="flex items-center gap-1 text-xs">
                           <RefreshCw className="h-3 w-3 animate-spin" />
                           Actualizando...
                        </span>
                     )}
                  </p>
               </div>
            </div>

            <div className="flex gap-2">
               <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-full sm:w-64">
                     <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todas las especialidades</SelectItem>
                     {specialties?.items.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                           {s.name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} className="shrink-0">
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
               </Button>
            </div>
         </div>

         {doctorAvailability.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
               No hay doctores disponibles con esta especialidad.
            </div>
         ) : (
            <div className="grid gap-4 md:grid-cols-2">
               {doctorAvailability.map((doctor) => (
                  <Card key={doctor.doctorId} className="bg-card border-border">
                     <CardHeader>
                        <div className="flex items-start justify-between">
                           <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                 <User className="h-6 w-6 text-chart-1" />
                              </div>
                              <div>
                                 <CardTitle className="text-card-foreground">{doctor.fullName}</CardTitle>
                                 <CardDescription>{doctor.specialtyName}</CardDescription>
                              </div>
                           </div>
                           <Badge variant="secondary" className={doctor.isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                              {doctor.isAvailable ? "Disponible" : "No Disponible"}
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                           <div className="p-3 rounded-lg bg-secondary/30">
                              <p className="text-xs text-muted-foreground mb-1">Próxima Consulta</p>
                              <span className="text-lg font-bold text-card-foreground">
                                 {/* dar formato a la fecha */}
                                 {doctor.nextAppointmentTime ? formatDate(doctor.nextAppointmentTime, "dd/MM/yyyy") : "Sin citas"}
                              </span>
                           </div>
                           <div className="p-3 rounded-lg bg-secondary/30">
                              <p className="text-xs text-muted-foreground mb-1">Próximo Horario</p>
                              <div className="flex items-center gap-2">
                                 <Clock className="h-4 w-4 text-chart-1" />
                                 <span className="text-sm font-medium text-card-foreground">
                                    {doctor.nextAppointmentDisplay}
                                 </span>
                              </div>
                           </div>
                           <div className="p-3 rounded-lg bg-secondary/30">
                              <p className="text-xs text-muted-foreground mb-1">Espacios Disponibles</p>
                              <span className="text-lg font-bold text-card-foreground">
                                 {doctor.availableSlotsToday}
                              </span>
                           </div>
                        </div>

                        <div className="pt-3 border-t border-border">
                           <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Citas agendadas hoy:</span>
                              <span className="font-medium text-card-foreground">
                                 {doctor.appointmentsTodayCount}
                              </span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );
};









// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Clock, User, Calendar, RefreshCw, AlertCircle } from "lucide-react";

// import { useSpecialties } from "@/clinica/hooks/useSpecialties";
// import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
// import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";

// export const DoctorAvailabilityPage = () => {
//     // "all" = todas las especialidades, cualquier otro string = ID
//     const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
//     const { data: specialties, isLoading: loadingSpecialties } = useSpecialties();

//     const { data: doctorAvailability = [], isLoading, isFetching, refetch, } = useDoctorsAvailability(selectedSpecialty === "all" ? null : selectedSpecialty);

//     const today = new Date();
//     const isSunday = today.getDay() === 0;
//     const isSaturday = today.getDay() === 6;

//     const getSlotsMessage = (slots: number) => {
//         if (slots === 0) return { text: "Sin turnos hoy", color: "text-red-600", icon: AlertCircle };
//         if (slots <= 3) return { text: `¡Solo ${slots} turnos!`, color: "text-orange-500", icon: AlertCircle };
//         return { text: `${slots} turnos libres`, color: "text-green-600", icon: null };
//     };

//     if (isLoading || loadingSpecialties) return <CustomFullScreenLoading />;

//     if (isSunday) {
//         return (
//             <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
//                 <div className="space-y-4">
//                     <div className="text-8xl">Closed</div>
//                     <h1 className="text-3xl font-bold">Cerrado los domingos</h1>
//                     <p className="text-lg text-muted-foreground">Volvemos el lunes a las 8:00 AM</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-8 p-6 max-w-7xl mx-auto">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//                 <div className="flex items-center gap-4">
//                     <div className="h-12 w-12 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
//                         <Calendar className="h-6 w-6 text-chart-1" />
//                     </div>
//                     <div>
//                         <h1 className="text-3xl font-bold">Disponibilidad de Doctores</h1>
//                         <p className="text-muted-foreground flex items-center gap-2">
//                             Estado en tiempo real
//                             {isFetching && (
//                                 <span className="flex items-center gap-1 text-xs">
//                                     <RefreshCw className="h-3 w-3 animate-spin" />
//                                     Actualizando...
//                                 </span>
//                             )}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex gap-3">
//                     <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
//                         <SelectTrigger className="w-64">
//                             <SelectValue placeholder="Todas las especialidades" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="all">Todas las especialidades</SelectItem>
//                             {specialties?.items.map((s) => (
//                                 <SelectItem key={s.id} value={s.id.toString()}>
//                                     {s.name}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>

//                     <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => refetch()}
//                         disabled={isFetching}
//                     >
//                         <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
//                     </Button>
//                 </div>
//             </div>

//             {/* Lista de doctores */}
//             {doctorAvailability.length === 0 ? (
//                 <div className="text-center py-20">
//                     <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
//                     <p className="text-xl text-muted-foreground">
//                         No hay doctores disponibles para la especialidad seleccionada.
//                     </p>
//                 </div>
//             ) : (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                     {doctorAvailability.map((doctor) => {
//                         const { text, color, icon: Icon } = getSlotsMessage(doctor.availableSlotsToday);

//                         return (
//                             <Card key={doctor.doctorId} className="hover:shadow-lg transition-shadow">
//                                 <CardHeader>
//                                     <div className="flex items-start justify-between gap-4">
//                                         <div className="flex items-center gap-3">
//                                             <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex shrink-0 items-center justify-center">
//                                                 <User className="h-6 w-6 text-chart-1" />
//                                             </div>
//                                             <div>
//                                                 <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
//                                                 <CardDescription>{doctor.specialtyName}</CardDescription>
//                                             </div>
//                                         </div>
//                                         <Badge
//                                             variant="secondary"
//                                             className={
//                                                 doctor.isAvailable
//                                                     ? "bg-green-500/20 text-green-400 border-green-500/30"
//                                                     : "bg-red-500/20 text-red-400 border-red-500/30"
//                                             }
//                                         >
//                                             {doctor.isAvailable ? "Disponible" : "En consulta"}
//                                         </Badge>
//                                     </div>
//                                 </CardHeader>

//                                 <CardContent className="space-y-5">
//                                     <div className="flex items-center gap-2 text-sm">
//                                         <Clock className="h-4 w-4 text-muted-foreground" />
//                                         <span className="font-medium">{doctor.nextAppointmentDisplay}</span>
//                                     </div>

//                                     <div className="rounded-xl bg-secondary/30 p-4 text-center">
//                                         <div className="text-3xl font-bold tabular-nums">
//                                             {doctor.availableSlotsToday}
//                                         </div>
//                                         <p className={`text-sm font-medium flex items-center justify-center gap-1 mt-1 ${color}`}>
//                                             {Icon && <Icon className="h-4 w-4" />}
//                                             {text}
//                                         </p>
//                                         {isSaturday && (
//                                             <p className="text-xs text-muted-foreground mt-1">(hasta 12:00 PM)</p>
//                                         )}
//                                     </div>

//                                     <div className="text-sm text-muted-foreground text-center pt-2 border-t">
//                                         {doctor.appointmentsTodayCount} cita{doctor.appointmentsTodayCount !== 1 ? "s" : ""} hoy
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// };







// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Clock, User, Calendar, RefreshCw } from "lucide-react";
// import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";
// import { useSpecialties } from "@/clinica/hooks/useSpecialties";
// import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";


// export const DoctorAvailabilityPage = () => {
//     const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
//     const [isRefetching, setIsRefetching] = useState(false);

//     const { data: specialties, isLoading: loadingSpecialties } = useSpecialties();
//     const { data: doctorAvailability, isLoading } = useDoctorsAvailability();

//     const today = new Date().getDay();
//     const isSunday = today === 0;

//     if (isLoading || loadingSpecialties) {
//         return <CustomFullScreenLoading />;
//     }

//     if (isSunday) {
//         return (
//             <div className="space-y-6">
//                 <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
//                         <Calendar className="h-5 w-5 text-chart-1" />
//                     </div>
//                     <div>
//                         <h2 className="text-2xl font-bold text-foreground">Disponibilidad de Doctores</h2>
//                         <p className="text-muted-foreground">Estado actual de disponibilidad del personal médico</p>
//                     </div>
//                 </div>
//                 <div className="flex flex-col items-center justify-center py-16">
//                     <div className="bg-muted/50 rounded-xl p-8 max-w-md text-center">
//                         <div className="text-6xl mb-4">Closed</div>
//                         <h3 className="text-xl font-semibold text-muted-foreground">Cerrado los domingos</h3>
//                         <p className="text-sm text-muted-foreground mt-2">Volveremos el lunes a las 8:00 AM</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
//                         <Calendar className="h-5 w-5 text-chart-1" />
//                     </div>
//                     <div>
//                         <h2 className="text-2xl font-bold text-foreground">Disponibilidad de Doctores</h2>
//                         <p className="text-muted-foreground flex items-center gap-2">
//                             Estado actual de disponibilidad del personal médico
//                             {isRefetching && (
//                                 <span className="flex items-center gap-1 text-xs">
//                                     <RefreshCw className="h-3 w-3 animate-spin" />
//                                     Actualizando...
//                                 </span>
//                             )}
//                         </p>
//                     </div>
//                 </div>

//                 <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value)}>
//                     <SelectTrigger className="w-full sm:w-64">
//                         <SelectValue placeholder="Todas las especialidades" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">Todas las especialidades</SelectItem>
//                         {specialties?.items.map((s) => (
//                             <SelectItem key={s.id} value={s.id.toString()} >
//                                 {s.name}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>

//             {doctorAvailability?.length === 0 ? (
//                 <div className="text-center py-12 text-muted-foreground">
//                     No hay doctores disponibles con esta especialidad.
//                 </div>
//             ) : (
//                 <div className="grid gap-4 md:grid-cols-2">
//                     {doctorAvailability?.map((doctor) => (
//                         <Card key={doctor.doctorId} className="bg-card border-border">
//                             <CardHeader>
//                                 <div className="flex items-start justify-between">
//                                     <div className="flex items-start gap-3">
//                                         <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
//                                             <User className="h-6 w-6 text-chart-1" />
//                                         </div>
//                                         <div>
//                                             <CardTitle className="text-card-foreground">{doctor.fullName}</CardTitle>
//                                             <CardDescription>{doctor.specialtyName}</CardDescription>
//                                         </div>
//                                     </div>
//                                     <Badge variant="secondary" className={doctor.isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
//                                         {doctor.isAvailable ? "Disponible" : "No Disponible"}
//                                     </Badge>
//                                 </div>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div className="p-3 rounded-lg bg-secondary/30">
//                                         <p className="text-xs text-muted-foreground mb-1">Próximo Horario</p>
//                                         <div className="flex items-center gap-2">
//                                             <Clock className="h-4 w-4 text-chart-1" />
//                                             <span className="text-sm font-medium text-card-foreground">
//                                                 {doctor.nextAppointmentDisplay}
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <div className="p-3 rounded-lg bg-secondary/30">
//                                         <p className="text-xs text-muted-foreground mb-1">Espacios Disponibles</p>
//                                         <span className="text-lg font-bold text-card-foreground">
//                                             {doctor.availableSlotsToday}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 <div className="pt-3 border-t border-border">
//                                     <div className="flex items-center justify-between text-sm">
//                                         <span className="text-muted-foreground">Citas agendadas hoy:</span>
//                                         <span className="font-medium text-card-foreground">
//                                             {doctor.appointmentsTodayCount}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };





