import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar } from "lucide-react"

const doctorAvailability = [
  {
    name: "Dr. Juan Pérez",
    specialty: "Medicina General",
    available: true,
    nextSlot: "10:00 AM",
    totalSlots: 3,
    bookedToday: 4,
  },
  {
    name: "Dra. Ana López",
    specialty: "Pediatría",
    available: true,
    nextSlot: "11:00 AM",
    totalSlots: 4,
    bookedToday: 3,
  },
  {
    name: "Dr. Roberto Silva",
    specialty: "Cardiología",
    available: true,
    nextSlot: "08:00 AM",
    totalSlots: 5,
    bookedToday: 2,
  },
  {
    name: "Dra. Carmen Díaz",
    specialty: "Dermatología",
    available: false,
    nextSlot: "Mañana 09:00 AM",
    totalSlots: 0,
    bookedToday: 7,
  },
]

export const DoctorAvailabilityPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Disponibilidad de Doctores</h2>
          <p className="text-muted-foreground">Estado actual de disponibilidad del personal médico</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {doctorAvailability.map((doctor, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-chart-1" />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    doctor.available
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {doctor.available ? "Disponible" : "No Disponible"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Próximo Horario</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-chart-1" />
                    <span className="text-sm font-medium text-card-foreground">{doctor.nextSlot}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Espacios Disponibles</p>
                  <span className="text-lg font-bold text-card-foreground">{doctor.totalSlots}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Citas agendadas hoy:</span>
                  <span className="font-medium text-card-foreground">{doctor.bookedToday}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
