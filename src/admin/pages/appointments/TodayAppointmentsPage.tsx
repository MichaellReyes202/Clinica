import { Link, useLocation } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Calendar, Clock, User, Phone, FileText, RefreshCw,
    Stethoscope, CheckCircle,
    Check,
    Loader2,
    Play
} from "lucide-react"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useTodayAppointments, useUpdateAppointmentStatus } from "@/clinica/hooks/useAppointments"
import { useConsultationFlow } from "@/clinica/hooks/useConsultationFlow"
import { StatsCard } from "@/admin/components/StatsCard"
import { useState } from "react"

// Badge Helper
const getStatusBadge = (status: string) => {
    switch (status) {
        case "Programada":
            return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Programada</Badge>
        case "Confirmada":
            return <Badge className="bg-green-600 hover:bg-green-700">Confirmada / En Sala</Badge>
        case "En curso":
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse">En curso</Badge>
        case "Completada":
            return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Completada</Badge>
        case "Cancelada":
            return <Badge variant="destructive">Cancelada</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export const TodayAppointmentsPage = () => {
    const locationCurrent = useLocation();
    const { data: appointments = [], isLoading, isFetching, refetch } = useTodayAppointments();
    const { mutation, isPosting } = useUpdateAppointmentStatus();
    const { startConsultation, isStarting } = useConsultationFlow();

    const [currentUpdatingId, setCurrentUpdatingId] = useState<number | null>(null);

    // Estadísticas rápidas
    const stats = {
        scheduled: appointments.filter(a => a.status === "Programada").length,
        confirmed: appointments.filter(a => a.status === "Confirmada").length,
        inProgress: appointments.filter(a => a.status === "En curso").length,
        completed: appointments.filter(a => a.status === "Completada").length
    }

    const handleAttend = (appointmentId: number, status: number) => {
        mutation.mutate({ AppointmenId: appointmentId, StatusId: status }, {
            onSuccess: () => {
                refetch();
                setCurrentUpdatingId(appointmentId);
            }
        });
    }

    if (isLoading) return <CustomFullScreenLoading />

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary border border-sidebar-primary/20">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Citas de Hoy</h2>
                        <p className="text-muted-foreground capitalize">
                            {new Date().toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="self-end md:self-auto">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                    Actualizando
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="En Sala de Espera" count={stats.confirmed} icon={User} color="text-green-600" bg="bg-green-100" />
                <StatsCard label="En Consulta" count={stats.inProgress} icon={Stethoscope} color="text-yellow-600" bg="bg-yellow-100" />
                <StatsCard label="Pendientes" count={stats.scheduled} icon={Clock} color="text-blue-600" bg="bg-blue-100" />
                <StatsCard label="Finalizadas" count={stats.completed} icon={CheckCircle} color="text-gray-600" bg="bg-gray-100" />
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle>Agenda del Día</CardTitle>
                    <CardDescription>Pacientes programados para atención</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {appointments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No hay citas programadas para hoy.</p>
                            </div>
                        ) : (
                            appointments.map((appt) => (
                                <div
                                    key={appt.id} className={`
                                relative flex flex-col md:flex-row gap-2 p-4 rounded-xl border transition-all
                                ${appt.status === 'En curso' ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 ring-1 ring-yellow-200' : 'border-border bg-card hover:border-sidebar-border/80'}
                           `}
                                >
                                    {/* Columna Izquierda: Hora */}
                                    <div className="flex md:flex-col items-center md:justify-center gap-2 md:w-24 md:border-r md:border-border pr-4">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-lg font-bold text-foreground">{appt.timeDisplay}</span>
                                    </div>

                                    {/* Columna Central: Datos Paciente */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between md:justify-start gap-3 flex-wrap">
                                            <h3 className="text-lg font-semibold text-foreground">{appt.patientFullName}</h3>
                                            {getStatusBadge(appt.status)}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>{appt.doctorFullName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{appt.patientPhone}</span>
                                            </div>
                                            <div className="flex items-start gap-2 sm:col-span-2">
                                                <FileText className="h-4 w-4 mt-0.5" />
                                                <span>{appt.reason || "Consulta General"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna Derecha: Acciones */}
                                    <div className="flex  md:flex-col  md:justify-center justify-end gap-2 md:mt-0 md:pl-4 md:border-l md:border-border min-w-[140px]">

                                        {
                                            (appt.status == "Programada") && (
                                                <>
                                                    <Button variant={"default"} className="w-full bg-sidebar-primary  text-white shadow-sm" onClick={() => handleAttend(appt.id, 2)}>
                                                        {isPosting && appt.id === currentUpdatingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                                        Confirmar
                                                    </Button>
                                                    <Button variant={"destructive"} className="w-full bg-sidebar-primary text-white shadow-sm" onClick={() => handleAttend(appt.id, 5)}>
                                                        {isPosting && appt.id === currentUpdatingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )
                                        }
                                        {
                                            // cuando la cita este confirmado se puede
                                            (appt.status == "Confirmada") && (
                                                // mover a esta ruta consultations/process/:appointmentId
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-card-foreground border-border bg-transparent"
                                                        onClick={() => startConsultation({ appointmentId: appt.id })}
                                                        disabled={isStarting}
                                                    >
                                                        {isStarting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                                                        Iniciar Consulta
                                                    </Button>
                                                </>
                                            )
                                        }
                                        {
                                            (appt.status == "En curso") && (
                                                <Link to={`/dashboard/consultations/process/${appt.id}`} state={{ from: locationCurrent }}>
                                                    <Button variant="ghost" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                                                        <Play className="h-4 w-4" />
                                                        Retomar Consulta
                                                    </Button>
                                                </Link>
                                            )
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
