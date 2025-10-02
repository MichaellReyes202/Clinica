

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FlaskConical, Clock } from "lucide-react"

export const DoctorDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard - Doctor</h2>
        <p className="text-muted-foreground">Vista general de sus actividades médicas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">8</div>
            <p className="text-xs text-muted-foreground">3 completadas, 5 pendientes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Pacientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">3</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Resultados Pendientes</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">5</div>
            <p className="text-xs text-muted-foreground">Para revisar</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Próxima Cita</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">10:30</div>
            <p className="text-xs text-muted-foreground">En 15 minutos</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Citas del Día</CardTitle>
            <CardDescription>Sus citas programadas para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  patient: "María González",
                  time: "09:00 AM",
                  reason: "Control de presión arterial",
                  status: "completed",
                },
                { patient: "Carlos Ruiz", time: "10:30 AM", reason: "Consulta general", status: "next" },
                { patient: "Ana Martínez", time: "11:00 AM", reason: "Seguimiento diabetes", status: "pending" },
                { patient: "José López", time: "02:00 PM", reason: "Revisión de exámenes", status: "pending" },
                { patient: "Laura Pérez", time: "03:30 PM", reason: "Consulta dermatológica", status: "pending" },
              ].map((appointment, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground">{appointment.patient}</p>
                      {appointment.status === "completed" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          Completada
                        </Badge>
                      )}
                      {appointment.status === "next" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-sidebar-primary/20 text-chart-1 border-sidebar-primary/30"
                        >
                          Próxima
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{appointment.reason}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{appointment.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients & Lab Results */}
        <div className="space-y-4">
          {/* Last Patients Attended */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Últimos Pacientes Atendidos</CardTitle>
              <CardDescription>Pacientes atendidos recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "María González", time: "09:15 AM", diagnosis: "Hipertensión controlada" },
                  { patient: "Pedro Ramírez", time: "08:30 AM", diagnosis: "Gripe común" },
                  { patient: "Sofía Castro", time: "Ayer 04:00 PM", diagnosis: "Control prenatal" },
                ].map((record, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-chart-1">{record.patient.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{record.patient}</p>
                      <p className="text-xs text-muted-foreground truncate">{record.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">{record.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Results Notifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resultados de Laboratorio</CardTitle>
              <CardDescription>Nuevos resultados disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "Ana Martínez", test: "Hemograma completo", status: "Disponible" },
                  { patient: "José López", test: "Perfil lipídico", status: "Disponible" },
                  { patient: "Laura Pérez", test: "Glucosa en ayunas", status: "Disponible" },
                  { patient: "Roberto Silva", test: "Examen de orina", status: "Disponible" },
                  { patient: "Carmen Díaz", test: "Prueba de tiroides", status: "Disponible" },
                ].map((result, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-4 w-4 text-chart-1" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{result.patient}</p>
                        <p className="text-xs text-muted-foreground">{result.test}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-sidebar-primary/20 text-chart-1 border-sidebar-primary/30"
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
