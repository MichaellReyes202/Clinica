

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlot {
  time: string
  available: boolean
  doctor: string
  patientName?: string
}

interface DoctorSchedule {
  [key: string]: TimeSlot[]
}

const mockSchedule: DoctorSchedule = {
  "Dr. Juan Pérez": [
    { time: "08:00", available: false, doctor: "Dr. Juan Pérez", patientName: "María González" },
    { time: "09:00", available: false, doctor: "Dr. Juan Pérez", patientName: "Carlos Ruiz" },
    { time: "10:00", available: true, doctor: "Dr. Juan Pérez" },
    { time: "11:00", available: false, doctor: "Dr. Juan Pérez", patientName: "Ana Martínez" },
    { time: "14:00", available: true, doctor: "Dr. Juan Pérez" },
    { time: "15:00", available: true, doctor: "Dr. Juan Pérez" },
    { time: "16:00", available: false, doctor: "Dr. Juan Pérez", patientName: "José López" },
  ],
  "Dra. Ana López": [
    { time: "08:00", available: true, doctor: "Dra. Ana López" },
    { time: "09:00", available: false, doctor: "Dra. Ana López", patientName: "Laura Pérez" },
    { time: "10:00", available: false, doctor: "Dra. Ana López", patientName: "Pedro Ramírez" },
    { time: "11:00", available: true, doctor: "Dra. Ana López" },
    { time: "14:00", available: true, doctor: "Dra. Ana López" },
    { time: "15:00", available: false, doctor: "Dra. Ana López", patientName: "Sofía Castro" },
    { time: "16:00", available: true, doctor: "Dra. Ana López" },
  ],
  "Dr. Roberto Silva": [
    { time: "08:00", available: true, doctor: "Dr. Roberto Silva" },
    { time: "09:00", available: true, doctor: "Dr. Roberto Silva" },
    { time: "10:00", available: true, doctor: "Dr. Roberto Silva" },
    { time: "11:00", available: false, doctor: "Dr. Roberto Silva", patientName: "Carmen Díaz" },
    { time: "14:00", available: false, doctor: "Dr. Roberto Silva", patientName: "Miguel Torres" },
    { time: "15:00", available: true, doctor: "Dr. Roberto Silva" },
    { time: "16:00", available: true, doctor: "Dr. Roberto Silva" },
  ],
}

interface AppointmentCalendarProps {
  onSlotSelect?: (slot: TimeSlot) => void
}

export const AppointmentCalendar = ({ onSlotSelect }: AppointmentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const doctors = Object.keys(mockSchedule)

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot)
      if (onSlotSelect) {
        onSlotSelect(slot)
      }
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Calendario de Disponibilidad</CardTitle>
            <CardDescription>Seleccione un horario disponible para agendar</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              className="text-card-foreground border-border bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-card-foreground min-w-[200px] text-center">
              {formatDate(selectedDate)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
              className="text-card-foreground border-border bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <div key={doctor} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-chart-1">{doctor.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-card-foreground">{doctor}</h3>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {mockSchedule[doctor].map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!slot.available}
                    className={cn(
                      "p-3 rounded-lg border transition-all text-sm font-medium",
                      slot.available
                        ? "border-border bg-background hover:border-sidebar-primary hover:bg-sidebar-primary/10 text-card-foreground cursor-pointer"
                        : "border-border bg-secondary/30 text-muted-foreground cursor-not-allowed",
                      selectedSlot?.time === slot.time &&
                      selectedSlot?.doctor === slot.doctor &&
                      "border-sidebar-primary bg-sidebar-primary/20",
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{slot.time}</span>
                      {!slot.available && slot.patientName && (
                        <span className="text-xs truncate w-full text-center">{slot.patientName}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border bg-background" />
            <span className="text-sm text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border bg-secondary/30" />
            <span className="text-sm text-muted-foreground">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-sidebar-primary bg-sidebar-primary/20" />
            <span className="text-sm text-muted-foreground">Seleccionado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
