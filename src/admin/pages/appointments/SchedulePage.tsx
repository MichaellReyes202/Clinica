

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/admin/components/AppointmentForm";
import { useGetDoctorBySpecialty } from "@/clinica/hooks/useSpecialties";
import { useAppointments } from "@/clinica/hooks/useAppointments";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import type { AppointmentResponseDto } from "@/interfaces/Appointment.response";
import esLocale from '@fullcalendar/core/locales/es';

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

const statusStyles: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" }, // Programada
  2: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }, // Confirmada 
  3: { bg: "#fecaca", border: "#ef4444", text: "#991b1b" }, // En curso 
  4: { bg: "#d1fae5", border: "#10b981", text: "#065f46" }, // Completada 
  5: { bg: "#e5e7eb", border: "#6b7280", text: "#374151" }, // Cancelada 
  6: { bg: "#fbbf24", border: "#f97316", text: "#7c2d12" }, // Vencida 
};

export const ScheduleAppointmentPage = () => {
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<AppointmentResponseDto | null>(null);

  const { data: doctorBySpecialty, isLoading: loadingSpecialties } = useGetDoctorBySpecialty();
  const { data: appointments = [], isLoading: loadingAppointments, refetch } = useAppointments();

  const handleSelect = (info: DateSelectArg): void => {
    setSelectedSlot(info.startStr);
    setSelectedEvent(null);
    setOpenForm(true);
    console.log(info)
  };

  const handleEventClick = (info: EventClickArg): void => {
    const eventId = parseInt(info.event.id, 10);
    const foundEvent = appointments.find((a) => a.id === eventId);
    console.log(eventId, foundEvent)
    if (foundEvent) {
      setSelectedEvent(foundEvent);
      setOpenForm(true);
    }
  };


  const events: CalendarEvent[] = appointments.map((apt) => {
    const style = statusStyles[apt.statusId] || statusStyles[1];

    const startLocal = new Date(apt.startTime).toISOString().slice(0, 19);
    const endLocal = new Date(apt.endTime).toISOString().slice(0, 19);

    return {
      id: apt.id.toString(),
      title: `Dr. ${apt.doctorFullName} - ${apt.patientFullName}`,
      start: startLocal,
      end: endLocal,
      estado: apt.status,
      allDay: false,
      backgroundColor: style.bg,
      borderColor: style.border,
      textColor: style.text, // ← ¡Texto con buen contraste!
    };
  });

  if (loadingSpecialties || loadingAppointments) {
    return <CustomFullScreenLoading />;
  }

  return (
    <Card className="p-4 shadow-lg">
      <CardHeader>
        <CardTitle>Gestión de Citas Médicas</CardTitle>
      </CardHeader>
      <CardContent>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={esLocale}
          initialView="dayGridMonth"
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          events={events}
          height="80vh"
          slotMinTime="07:59:00"  // desde 6 AM (para cubrir temprano)
          slotMaxTime="17:01:00"  // hasta 8 PM
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
      <Dialog open={openForm} onOpenChange={setOpenForm} >
        <DialogContent className="max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Detalles / Editar Cita" : "Nueva Cita"}
            </DialogTitle>
          </DialogHeader>

          <AppointmentForm
            mode={selectedEvent ? "edit" : "create"} initialStart={selectedSlot} initialEvent={selectedEvent} setOpen={setOpenForm} doctorBySpecialty={doctorBySpecialty || []} onEventSaved={refetch}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};








