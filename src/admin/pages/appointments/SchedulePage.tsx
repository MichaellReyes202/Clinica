

import { useState } from "react"

import { CalendarPlus } from "lucide-react"
import { AppointmentCalendar } from "@/admin/components/AppointmentCalendar"
import { AppointmentForm } from "@/admin/components/AppointmentForm"
import { useNavigate } from "react-router"

export const ScheduleAppointmentPage = () => {
  const navigate = useNavigate()
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot)
  }

  const handleSubmit = (data: any) => {
    console.log("Appointment scheduled:", { ...data, ...selectedSlot })
    alert("Cita agendada exitosamente")
    navigate("/dashboard/appointments/today")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <CalendarPlus className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agendar Cita</h2>
          <p className="text-muted-foreground">Seleccione un horario disponible y complete el formulario</p>
        </div>
      </div>

      <AppointmentCalendar onSlotSelect={handleSlotSelect} />

      {selectedSlot && (
        <AppointmentForm
          initialData={{
            doctor: selectedSlot.doctor,
            time: selectedSlot.time,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
