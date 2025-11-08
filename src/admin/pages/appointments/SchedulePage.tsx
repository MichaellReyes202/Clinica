
// import { useState } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { AppointmentForm } from "@/admin/components/AppointmentForm";
// import { useGetDoctorBySpecialty } from "@/clinica/hooks/useSpecialties";
// import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";


// export const ScheduleAppointmentPage = () => {
//   const [events, setEvents] = useState([
//     { id: "1", title: "Consulta Dr. Pérez", start: "2025-11-03T10:00:00", end: "2025-11-03T11:00:00" },
//   ]);

//   const [open, setOpen] = useState(false);
//   const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });


//   const { data: doctorBySpecialty, isLoading } = useGetDoctorBySpecialty();


//   const handleDateClick = (arg: any) => {
//     alert(arg.dateStr)
//   }
//   const handleDateSelect = (info: any) => {
//     setNewEvent({
//       title: "",
//       start: info.startStr,
//       end: info.endStr
//     });
//     console.log({
//       title: "",
//       start: info.startStr,
//       end: info.endStr
//     })
//     //setOpen(true);
//   };

//   // Crear evento
//   const handleAddEvent = () => {
//     if (!newEvent.title.trim()) return;
//     setEvents([...events, { id: Date.now().toString(), ...newEvent }]);
//     setOpen(false);
//   };

//   if (isLoading) {
//     return <CustomFullScreenLoading />
//   }
//   console.log(doctorBySpecialty?.slice(1))

//   return (
//     <Card className="p-4 shadow-lg">
//       <CardHeader>
//         <CardTitle>Gestión de Citas Médicas</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek" selectable={true} editable={true}
//           events={events}
//           select={(info) => handleDateSelect(info)}
//           height="80vh"
//           headerToolbar={{
//             left: "prev,next today",
//             center: "title",
//             right: "dayGridMonth,timeGridWeek,timeGridDay",
//           }}
//           eventColor="#0ea5e9"
//         />
//       </CardContent>


//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
//           <CardHeader>
//             <CardTitle className="text-card-foreground">Información de la Cita</CardTitle>
//             <CardDescription>Complete los datos para agendar la cita</CardDescription>
//           </CardHeader>
//           {/* Contenido de la ventana de dialogo */}

//           <AppointmentForm setOpen={setOpen} doctorBySpecialty={doctorBySpecialty || []} />
//         </DialogContent>
//       </Dialog>
//     </Card>
//   );
// }

// pages/ScheduleAppointmentPage.tsx
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/admin/components/AppointmentForm";
import { useGetDoctorBySpecialty } from "@/clinica/hooks/useSpecialties";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";

export const ScheduleAppointmentPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const { data: doctorBySpecialty, isLoading } = useGetDoctorBySpecialty();

  const handleSelect = (info: any) => {
    setSelectedSlot(info.startStr);
    setOpen(true);
  };

  const handleEventAdded = (event: { title: string; start: string; end: string }) => {
    setEvents((prev) => [...prev, { id: Date.now().toString(), ...event }]);
  };

  if (isLoading) return <CustomFullScreenLoading />;

  return (
    <Card className="p-4 shadow-lg">
      <CardHeader>
        <CardTitle>Gestión de Citas Médicas</CardTitle>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          select={handleSelect}
          events={events}
          height="80vh"
          slotMinTime="08:00:00"
          slotMaxTime="17:00:00"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventColor="#0ea5e9"
        />
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initialStart={selectedSlot}
            setOpen={setOpen}
            doctorBySpecialty={doctorBySpecialty || []}
            onEventAdded={handleEventAdded}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
