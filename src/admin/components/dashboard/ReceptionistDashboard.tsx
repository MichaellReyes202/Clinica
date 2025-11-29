import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, UserPlus, Clock } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getAppointments } from "@/clinica/actions/Appointments.action"
import { getPatientAction } from "@/clinica/actions/Patient.action"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export const ReceptionistDashboard = () => {
    const today = new Date();
    const dateString = format(today, 'yyyy-MM-dd');

    // Fetch today's appointments (all doctors)
    const { data: appointments, isLoading: isLoadingAppts } = useQuery({
        queryKey: ["receptionist-dashboard-appointments", dateString],
        queryFn: () => getAppointments({
            dateFrom: dateString,
            dateTo: dateString
        }),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Fetch recent patients to count new ones today
    const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
        queryKey: ["receptionist-dashboard-patients"],
        queryFn: () => getPatientAction({ limit: 50, offset: 0 }), // Fetch enough to find today's
        staleTime: 1000 * 60 * 5
    });

    // Calculate Stats
    const totalAppointments = appointments?.length || 0;
    const confirmedAppointments = appointments?.filter(a => a.statusId === 2).length || 0; // 2 = Confirmed
    const pendingAppointments = appointments?.filter(a => a.statusId === 1).length || 0; // 1 = Pending

    // New patients today
    const newPatientsToday = patientsData?.items.filter(p => {
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        return format(createdDate, 'yyyy-MM-dd') === dateString;
    }).length || 0;

    // Next upcoming appointment
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

    // Recent patients list (just the latest registered)
    const recentPatientsList = patientsData?.items.slice(0, 5) || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard - Recepcionista</h2>
                <p className="text-muted-foreground">Vista general de recepción</p>
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
                        <p className="text-xs text-muted-foreground">{confirmedAppointments} confirmadas, {pendingAppointments} pendientes</p>
                    </CardContent>
                </Card>

                {/* Placeholder for Cash - No endpoint */}
                <Card className="bg-card border-border opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Ingresos del Día</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">--</div>
                        <p className="text-xs text-muted-foreground">No disponible</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Nuevos Pacientes</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{newPatientsToday}</div>
                        <p className="text-xs text-muted-foreground">Registrados hoy</p>
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
                            {nextAppointment ? nextAppointment.patientFullName : "No hay más citas"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Upcoming Appointments */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-card-foreground">Citas Próximas</CardTitle>
                            <CardDescription>Próximas citas programadas para hoy</CardDescription>
                        </div>
                        <Link to="/dashboard/appointments/today">
                            <Button variant="outline" size="sm">Ver Todo</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {isLoadingAppts ? (
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
                                                    className={`text-xs ${appointment.statusId === 2 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                        appointment.statusId === 1 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                                            "bg-secondary text-secondary-foreground"
                                                        }`}
                                                >
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{appointment.doctorFullName}</p>
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{format(new Date(appointment.startTime), 'HH:mm')}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* New Patients Notifications */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Últimos Pacientes Registrados</CardTitle>
                        <CardDescription>Pacientes registrados recientemente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {isLoadingPatients ? (
                                <p className="text-sm text-muted-foreground">Cargando pacientes...</p>
                            ) : recentPatientsList.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay pacientes recientes.</p>
                            ) : (
                                recentPatientsList.map((patient, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                            <UserPlus className="h-5 w-5 text-chart-1" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-card-foreground">{patient.firstName} {patient.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{patient.contactPhone || "Sin teléfono"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {patient.createdAt ? format(new Date(patient.createdAt), "d MMM, hh:mm a", { locale: es }) : "N/D"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
