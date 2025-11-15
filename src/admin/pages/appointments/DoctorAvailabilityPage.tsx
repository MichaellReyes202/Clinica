

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, Calendar, RefreshCw } from "lucide-react";
import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";
import { useSpecialties } from "@/clinica/hooks/useSpecialties";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";


export const DoctorAvailabilityPage = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState(false);

  const { data: specialties, isLoading: loadingSpecialties } = useSpecialties();
  const { data: doctorAvailability, isLoading } = useDoctorsAvailability();



  // Refetch al cambiar filtro
  // useEffect(() => {
  //   setIsRefetching(true);
  //   refetch().finally(() => setIsRefetching(false));
  // }, [selectedSpecialty, refetch]);

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
            <h2 className="text-3xl font-bold text-foreground">Disponibilidad de Doctores</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              Estado actual de disponibilidad del personal médico
              {isRefetching && (
                <span className="flex items-center gap-1 text-xs">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Actualizando...
                </span>
              )}
            </p>
          </div>
        </div>

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
      </div>

      {doctorAvailability?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay doctores disponibles con esta especialidad.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctorAvailability?.map((doctor) => (
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
                <div className="grid grid-cols-2 gap-4">
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


















// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Clock, User, Calendar } from "lucide-react"
// import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments"
// import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"


// export const DoctorAvailabilityPage = () => {

//   const { data: doctorAvailability, isLoading } = useDoctorsAvailability();

//   if (isLoading) {
//     return <CustomFullScreenLoading />
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-3">
//         <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
//           <Calendar className="h-5 w-5 text-chart-1" />
//         </div>
//         <div>
//           <h2 className="text-3xl font-bold text-foreground">Disponibilidad de Doctores</h2>
//           <p className="text-muted-foreground">Estado actual de disponibilidad del personal médico</p>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         {doctorAvailability.map((doctor, index) => (
//           <Card key={index} className="bg-card border-border">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="flex items-start gap-3">
//                   <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
//                     <User className="h-6 w-6 text-chart-1" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-card-foreground">{doctor.name}</CardTitle>
//                     <CardDescription>{doctor.specialty}</CardDescription>
//                   </div>
//                 </div>
//                 <Badge
//                   variant="secondary"
//                   className={
//                     doctor.available
//                       ? "bg-green-500/20 text-green-400 border-green-500/30"
//                       : "bg-red-500/20 text-red-400 border-red-500/30"
//                   }
//                 >
//                   {doctor.available ? "Disponible" : "No Disponible"}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="p-3 rounded-lg bg-secondary/30">
//                   <p className="text-xs text-muted-foreground mb-1">Próximo Horario</p>
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-4 w-4 text-chart-1" />
//                     <span className="text-sm font-medium text-card-foreground">{doctor.nextSlot}</span>
//                   </div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-secondary/30">
//                   <p className="text-xs text-muted-foreground mb-1">Espacios Disponibles</p>
//                   <span className="text-lg font-bold text-card-foreground">{doctor.totalSlots}</span>
//                 </div>
//               </div>

//               <div className="pt-3 border-t border-border">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-muted-foreground">Citas agendadas hoy:</span>
//                   <span className="font-medium text-card-foreground">{doctor.bookedToday}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }
