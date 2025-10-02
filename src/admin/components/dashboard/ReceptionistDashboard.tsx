import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, UserPlus, Clock } from "lucide-react"

export const ReceptionistDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard - Recepcionista</h2>
        <p className="text-muted-foreground">Vista general de recepción y caja</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">24</div>
            <p className="text-xs text-muted-foreground">18 confirmadas, 6 pendientes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Ingresos del Día</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">$2,450</div>
            <p className="text-xs text-muted-foreground">15 transacciones</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Nuevos Pacientes</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">5</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Próxima Cita</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">10:15</div>
            <p className="text-xs text-muted-foreground">María González</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Citas Próximas</CardTitle>
            <CardDescription>Próximas citas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { patient: "María González", time: "10:15 AM", doctor: "Dr. Juan Pérez", status: "confirmed" },
                { patient: "Carlos Ruiz", time: "10:30 AM", doctor: "Dra. Ana López", status: "confirmed" },
                { patient: "Ana Martínez", time: "11:00 AM", doctor: "Dr. Juan Pérez", status: "pending" },
                { patient: "José López", time: "11:30 AM", doctor: "Dr. Roberto Silva", status: "confirmed" },
                { patient: "Laura Pérez", time: "12:00 PM", doctor: "Dra. Ana López", status: "pending" },
                { patient: "Pedro Ramírez", time: "02:00 PM", doctor: "Dr. Juan Pérez", status: "confirmed" },
              ].map((appointment, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground">{appointment.patient}</p>
                      {appointment.status === "confirmed" ? (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          Confirmada
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        >
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{appointment.doctor}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{appointment.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash Summary & New Patients */}
        <div className="space-y-4">
          {/* Daily Cash Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resumen de Caja del Día</CardTitle>
              <CardDescription>Movimientos financieros de hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Total Ingresos</p>
                    <p className="text-xs text-muted-foreground">15 transacciones</p>
                  </div>
                  <span className="text-lg font-bold text-green-400">$2,450.00</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-card-foreground">Desglose por Servicio</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Consultas</span>
                      <span className="text-card-foreground font-medium">$1,200.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exámenes de Laboratorio</span>
                      <span className="text-card-foreground font-medium">$850.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Medicamentos</span>
                      <span className="text-card-foreground font-medium">$400.00</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Efectivo</span>
                    <span className="text-sm text-card-foreground">$1,800.00</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Tarjeta</span>
                    <span className="text-sm text-card-foreground">$650.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Patients Notifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Nuevos Pacientes</CardTitle>
              <CardDescription>Pacientes registrados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Roberto Silva", date: "Hoy 09:30 AM", phone: "(505) 8765-4321" },
                  { name: "Carmen Díaz", date: "Hoy 08:15 AM", phone: "(505) 8234-5678" },
                  { name: "Miguel Ángel Torres", date: "Ayer 03:45 PM", phone: "(505) 8456-7890" },
                  { name: "Patricia Morales", date: "Ayer 11:20 AM", phone: "(505) 8567-8901" },
                  { name: "Fernando Gutiérrez", date: "26 Sep 02:30 PM", phone: "(505) 8678-9012" },
                ].map((patient, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                      <UserPlus className="h-5 w-5 text-chart-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">{patient.date}</p>
                    </div>
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
