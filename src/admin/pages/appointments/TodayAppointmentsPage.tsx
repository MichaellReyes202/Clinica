import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone, FileText, Edit, X } from "lucide-react"

const todayAppointments = [
  {
    id: "1",
    time: "08:00 AM",
    patient: "María González",
    phone: "(505) 8765-4321",
    doctor: "Dr. Juan Pérez",
    specialty: "Medicina General",
    reason: "Control de presión arterial",
    status: "completed",
  },
  {
    id: "2",
    time: "09:00 AM",
    patient: "Laura Pérez",
    phone: "(505) 8678-9012",
    doctor: "Dra. Ana López",
    specialty: "Pediatría",
    reason: "Vacunación infantil",
    status: "completed",
  },
  {
    id: "3",
    time: "10:00 AM",
    patient: "Carlos Ruiz",
    phone: "(505) 8234-5678",
    doctor: "Dr. Juan Pérez",
    specialty: "Medicina General",
    reason: "Consulta general - dolor de cabeza",
    status: "in-progress",
  },
  {
    id: "4",
    time: "10:30 AM",
    patient: "Pedro Ramírez",
    phone: "(505) 8456-7890",
    doctor: "Dra. Ana López",
    specialty: "Pediatría",
    reason: "Control de crecimiento",
    status: "confirmed",
  },
  {
    id: "5",
    time: "11:00 AM",
    patient: "Ana Martínez",
    phone: "(505) 8456-7890",
    doctor: "Dr. Juan Pérez",
    specialty: "Medicina General",
    reason: "Seguimiento diabetes",
    status: "confirmed",
  },
  {
    id: "6",
    time: "11:30 AM",
    patient: "Carmen Díaz",
    phone: "(505) 8567-8901",
    doctor: "Dr. Roberto Silva",
    specialty: "Cardiología",
    reason: "Revisión cardiológica",
    status: "confirmed",
  },
  {
    id: "7",
    time: "02:00 PM",
    patient: "José López",
    phone: "(505) 8567-8901",
    doctor: "Dr. Juan Pérez",
    specialty: "Medicina General",
    reason: "Revisión de exámenes de laboratorio",
    status: "pending",
  },
  {
    id: "8",
    time: "02:30 PM",
    patient: "Miguel Torres",
    phone: "(505) 8678-9012",
    doctor: "Dr. Roberto Silva",
    specialty: "Cardiología",
    reason: "Control post-operatorio",
    status: "pending",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          Completada
        </Badge>
      )
    case "in-progress":
      return (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          En Progreso
        </Badge>
      )
    case "confirmed":
      return (
        <Badge variant="secondary" className="bg-sidebar-primary/20 text-chart-1 border-sidebar-primary/30">
          Confirmada
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          Pendiente
        </Badge>
      )
    default:
      return null
  }
}

export const TodayAppointmentsPage = () => {
  const completedCount = todayAppointments.filter((apt) => apt.status === "completed").length
  const inProgressCount = todayAppointments.filter((apt) => apt.status === "in-progress").length
  const pendingCount = todayAppointments.filter((apt) => apt.status === "pending" || apt.status === "confirmed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Citas del Día</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-card-foreground">{completedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold text-card-foreground">{inProgressCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-card-foreground">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Citas</CardTitle>
          <CardDescription>Todas las citas programadas para hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <Clock className="h-5 w-5 text-chart-1" />
                      <span className="text-lg font-bold text-card-foreground">{appointment.time}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-card-foreground">{appointment.patient}</h3>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-card-foreground">{appointment.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-card-foreground">{appointment.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground text-xs">{appointment.specialty}</p>
                          <p className="text-card-foreground">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-card-foreground border-border bg-transparent"
                      title="Reprogramar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive border-border bg-transparent hover:bg-destructive/10"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
