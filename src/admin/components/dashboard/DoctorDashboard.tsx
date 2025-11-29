import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FlaskConical, Clock } from "lucide-react"
import { useAuthStore } from "@/auth/store/auth.store"
import { useQuery } from "@tanstack/react-query"
import { getAppointments } from "@/clinica/actions/Appointments.action"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export const DoctorDashboard = () => {
    const user = useAuthStore(state => state.user);
    const today = new Date();
    const dateString = format(today, 'yyyy-MM-dd');

    const { data: appointments, isLoading } = useQuery({
        queryKey: ["doctor-dashboard-appointments", user?.employeeId, dateString],
        queryFn: () => getAppointments({
            doctor: user?.employeeId,
            dateFrom: dateString,
            dateTo: dateString
        }),
        enabled: !!user?.employeeId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Calculate stats
    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a => a.statusId === 3).length || 0; // Assuming 3 is completed
    const pendingAppointments = appointments?.filter(a => a.statusId === 1 || a.statusId === 2).length || 0; // Assuming 1=Pending, 2=Confirmed

    // Find next appointment (first pending/confirmed one after now)
    const now = new Date();
    const nextAppointment = appointments
        ?.filter(a => (a.statusId === 1 || a.statusId === 2))
        .sort((a, b) => {
            const dateA = new Date(a.startTime);
            const dateB = new Date(b.startTime);
            return dateA.getTime() - dateB.getTime();
        })
        .find(a => {
            const appTime = new Date(a.startTime);
            return appTime > now;
        });

    // Get recent patients (unique patients from completed appointments)
    const recentPatients = appointments
        ?.filter(a => a.statusId === 3)
        .slice(0, 5) || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard - Doctor</h2>
                <p className="text-muted-foreground">Bienvenido, Dr. {user?.fullName}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Citas Hoy</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">{completedAppointments} completadas, {pendingAppointments} pendientes</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Pacientes Atendidos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{completedAppointments}</div>
                        <p className="text-xs text-muted-foreground">Hoy</p>
                    </CardContent>
                </Card>

                {/* Placeholder for Lab Results - No direct hook available yet */}
                <Card className="bg-card border-border opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Resultados Pendientes</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">-</div>
                        <p className="text-xs text-muted-foreground">Próximamente</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Próxima Cita</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">
                            {nextAppointment ? format(new Date(nextAppointment.startTime), 'HH:mm') : "--:--"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {nextAppointment ? nextAppointment.patientFullName : "No hay más citas hoy"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Today's Appointments */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-card-foreground">Citas del Día</CardTitle>
                            <CardDescription>Sus citas programadas para hoy {format(today, "d 'de' MMMM", { locale: es })}</CardDescription>
                        </div>
                        <Link to="/dashboard/appointments/today">
                            <Button variant="outline" size="sm">Ver Todo</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground">Cargando citas...</p>
                            ) : appointments?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay citas programadas para hoy.</p>
                            ) : (
                                appointments?.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-card-foreground">{appointment.patientFullName}</p>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${appointment.statusId === 3 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                        appointment.statusId === 4 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                                            "bg-sidebar-primary/20 text-chart-1 border-sidebar-primary/30"
                                                        }`}
                                                >
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{appointment.reason || "Sin motivo especificado"}</p>
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{format(new Date(appointment.startTime), 'HH:mm')}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Patients */}
                <div className="space-y-4">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">Últimos Pacientes Atendidos</CardTitle>
                            <CardDescription>Pacientes atendidos hoy</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentPatients.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No se han atendido pacientes hoy.</p>
                                ) : (
                                    recentPatients.map((record, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-medium text-chart-1">{record.patientFullName.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-card-foreground">{record.patientFullName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{record.reason}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{format(new Date(record.startTime), 'HH:mm')}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
