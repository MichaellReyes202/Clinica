import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/admin/pages/appointments/components/AppointmentForm";
import { useGetDoctorBySpecialty } from "@/clinica/hooks/useSpecialties";
import { useAppointments } from "@/clinica/hooks/useAppointments";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { FilterSection } from "@/admin/components/filters/FilterSection";
import type { AppointmentResponseDto } from "@/interfaces/Appointment.response";
import esLocale from '@fullcalendar/core/locales/es';
import './calendar-styles.css';

interface CalendarEvent {
   id: string;
   title: string;
   start: string;
   end: string;
   estado: string;
   allDay: boolean;
   backgroundColor?: string;
   borderColor?: string;
}

// Colores mejorados con mejor contraste para dark mode
const statusStyles: Record<number, { bg: string; border: string; text: string }> = {
   1: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" }, // Programada - Azul
   2: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" }, // Confirmada - Ámbar
   3: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" }, // En curso - Rojo
   4: { bg: "#10b981", border: "#059669", text: "#ffffff" }, // Completada - Verde
   5: { bg: "#6b7280", border: "#4b5563", text: "#ffffff" }, // Cancelada - Gris
   6: { bg: "#f97316", border: "#ea580c", text: "#ffffff" }, // Vencida - Naranja
};

export const ScheduleAppointmentPage = () => {
   const [openForm, setOpenForm] = useState<boolean>(false);
   const [selectedSlot, setSelectedSlot] = useState<string>("");
   const [selectedEvent, setSelectedEvent] = useState<AppointmentResponseDto | null>(null);
   const [isPosting, setIsPosting] = useState<boolean>(false);

   const { data: doctorBySpecialty, isLoading: loadingSpecialties } = useGetDoctorBySpecialty();
   const { data: appointments = [], isLoading: loadingAppointments, refetch } = useAppointments();

   // Opciones de estado para citas
   const appointmentStatusOptions = [
      { value: "1", label: "Programada" },
      { value: "2", label: "Confirmada" },
      { value: "3", label: "En curso" },
      { value: "4", label: "Completada" },
      { value: "5", label: "Cancelada" },
      { value: "6", label: "Vencida" },
   ];

   // Obtener lista única de especialidades con sus IDs reales
   const specialties = useMemo(() => {
      if (!doctorBySpecialty) return [];
      // doctorBySpecialty ya contiene especialidades únicas con sus IDs reales
      return doctorBySpecialty.map(d => ({ id: d.id, name: d.name }));
   }, [doctorBySpecialty]);


   const filteredAppointments = appointments;




   const handleSelect = (info: DateSelectArg): void => {
      setSelectedSlot(info.startStr);
      setSelectedEvent(null);
      setOpenForm(true);
   };

   const handleEventClick = (info: EventClickArg): void => {
      const eventId = parseInt(info.event.id, 10);
      const foundEvent = appointments.find((a) => a.id === eventId);
      if (foundEvent) {
         setSelectedEvent(foundEvent);
         setOpenForm(true);
      }
   };

   const events: CalendarEvent[] = filteredAppointments.map((apt) => {
      const style = statusStyles[apt.statusId] || statusStyles[1];
      return {
         id: apt.id.toString(),
         title: `Dr. ${apt.doctorFullName} - ${apt.patientFullName}`,
         start: apt.startTime,
         end: apt.endTime,
         estado: apt.status,
         allDay: false,
         backgroundColor: style.bg,
         borderColor: style.border,
         textColor: style.text,
      };
   });

   if (loadingSpecialties || loadingAppointments) {
      return <CustomFullScreenLoading />;
   }

   return (
      <Card className="p-4 shadow-lg">
         <CardHeader>
            <CardTitle className="text-xl font-bold font-sans">Gestión de Citas Médicas</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            <FilterSection statusOptions={appointmentStatusOptions} specialtyOptions={specialties} showDoctorFilter={true} doctorsBySpecialty={doctorBySpecialty || []} />

            {/* Calendario */}
            <FullCalendar
               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
               headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
               }}
               locale={esLocale}
               timeZone="local"
               initialView="dayGridMonth"
               selectable={true}
               select={handleSelect}
               eventClick={handleEventClick}
               events={events}
               height="80vh"
               slotMinTime="07:59:00"
               slotMaxTime="17:01:00"
               slotDuration="00:15:00"
               slotLabelInterval="00:30:00"
               eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
               }}
               displayEventEnd={true}
               nowIndicator={true}
            />
         </CardContent>

         {/* Modal para crear o editar cita */}
         <Dialog open={openForm} onOpenChange={() => {
            if (!isPosting) {
               setOpenForm(false);
            }
         }} >
            <DialogContent className="max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl" onInteractOutside={(e) => {
               if (!isPosting) {
                  e.preventDefault();
               }
            }}>
               <DialogHeader>
                  <DialogTitle>
                     {selectedEvent ? "Detalles / Editar Cita" : "Nueva Cita"}
                  </DialogTitle>
               </DialogHeader>

               <AppointmentForm
                  mode={selectedEvent ? "edit" : "create"}
                  initialStart={selectedSlot}
                  initialEvent={selectedEvent}
                  onClose={setOpenForm}
                  setIsPosting={setIsPosting}
                  doctorBySpecialty={doctorBySpecialty || []}
                  onEventSaved={refetch}
               />
            </DialogContent>
         </Dialog>
      </Card>
   );
};
