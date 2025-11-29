import { Link, useLocation } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Calendar as CalendarIcon, Clock, User, Phone, FileText, RefreshCw,
    Stethoscope, CheckCircle,
    Check,
    Loader2,
    Play,
    Eye,
    Download
} from "lucide-react"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useTodayAppointments, useUpdateAppointmentStatus } from "@/clinica/hooks/useAppointments"
import { useConsultationFlow, useConsultationDetail } from "@/clinica/hooks/useConsultationFlow"
import { getConsultationPdfAction } from "@/clinica/actions/Consultation.action"
import { toast } from "sonner"
import { StatsCard } from "@/admin/components/StatsCard"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Badge Helper
const getStatusBadge = (status: string) => {
    switch (status) {
        case "Programada": return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Programada</Badge>
        case "Confirmada": return <Badge className="bg-green-600 hover:bg-green-700">Confirmada / En Sala</Badge>
        case "En curso": return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse">En curso</Badge>
        case "Completada": return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Completada</Badge>
        case "Cancelada": return <Badge variant="destructive">Cancelada</Badge>
        default: return <Badge variant="outline">{status}</Badge>
    }
}

export const TodayAppointmentsPage = () => {
    const locationCurrent = useLocation();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);
    const [showPdfDialog, setShowPdfDialog] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const { data: appointments = [], isLoading, isFetching, refetch } = useTodayAppointments(date);
    const { mutation, isPosting } = useUpdateAppointmentStatus();
    const { startConsultation, isStarting } = useConsultationFlow();

    // Fetch details only when an appointment is selected
    const { data: consultationDetails, isLoading: isLoadingDetails } = useConsultationDetail(selectedAppointmentId || 0);

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


    const handleViewDetails = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setShowDetailsDialog(true);
    };

    const handlePreviewPdf = async (appointmentId: number) => {
        try {
            setSelectedAppointmentId(appointmentId);
            setIsDownloading(appointmentId);
            const blob = await getConsultationPdfAction(appointmentId);

            // Crear URL del blob
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
            setShowPdfDialog(true);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF");
        } finally {
            setIsDownloading(null);
        }
    };

    if (isLoading) return <CustomFullScreenLoading />

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary border border-sidebar-primary/20">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Citas</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-muted-foreground capitalize">
                                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Seleccione una fecha"}
                            </p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "h-8 w-8 p-0 ml-2",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
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
                                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No hay citas programadas para esta fecha.</p>
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
                                            (appt.status == "Confirmada") && (
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
                                                    <Button variant="ghost" size="sm" className="w-full text-card-foreground border-border bg-transparent"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Retomar Consulta
                                                    </Button>
                                                </Link>
                                            )
                                        }
                                        {
                                            (appt.status == "Completada") && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleViewDetails(appt.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ver Detalles
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handlePreviewPdf(appt.id)}
                                                        disabled={isDownloading === appt.id}
                                                    >
                                                        {isDownloading === appt.id ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4 mr-2" />
                                                        )}
                                                        Ver PDF
                                                    </Button>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Consulta</DialogTitle>
                        <DialogDescription>
                            Resumen de la atención médica brindada.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : consultationDetails ? (
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 py-4">
                                {/* Información General */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                                        <p className="text-base font-semibold">{consultationDetails.patientName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                                        <p className="text-base font-semibold">{consultationDetails.doctorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                                        <p className="text-base">{new Date(consultationDetails.createdAt).toLocaleDateString("es-NI")}</p>
                                    </div>
                                </div>

                                {/* Diagnóstico y Notas */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold border-b pb-2">Diagnóstico y Tratamiento</h4>
                                    <div className="grid gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Motivo de Consulta</p>
                                            <p className="text-sm">{consultationDetails.reason || "No registrado"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                                            <p className="text-sm">{consultationDetails.diagnosis || "No registrado"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Notas de Tratamiento</p>
                                            <p className="text-sm">{consultationDetails.treatmentNotes || "No registrado"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recetas */}
                                {consultationDetails.prescriptions && consultationDetails.prescriptions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold border-b pb-2">Receta Médica</h4>
                                        {consultationDetails.prescriptions.map((prescription) => (
                                            <div key={prescription.id} className="space-y-2">
                                                <div className="bg-card border rounded-md p-3">
                                                    <ul className="space-y-2">
                                                        {prescription.items.map((item, idx) => (
                                                            <li key={idx} className="text-sm grid grid-cols-12 gap-2 items-center border-b last:border-0 pb-2 last:pb-0">
                                                                <span className="col-span-4 font-medium">{item.medicationName}</span>
                                                                <span className="col-span-3 text-muted-foreground">{item.dose}</span>
                                                                <span className="col-span-3 text-muted-foreground">{item.frequency}</span>
                                                                <span className="col-span-2 text-muted-foreground">{item.duration}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {prescription.notes && (
                                                        <p className="text-xs text-muted-foreground mt-2 italic">Nota: {prescription.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Exámenes */}
                                {consultationDetails.exams && consultationDetails.exams.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold border-b pb-2">Exámenes Solicitados</h4>
                                        <div className="bg-card border rounded-md p-3">
                                            <ul className="space-y-1">
                                                {consultationDetails.exams.map((exam) => (
                                                    <li key={exam.id} className="flex justify-between items-center text-sm py-1">
                                                        <span>{exam.examTypeName}</span>
                                                        <Badge variant="outline">{exam.status}</Badge>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            No se encontraron detalles para esta consulta.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Vista Previa del Reporte</DialogTitle>
                        <DialogDescription>
                            Puede visualizar el reporte antes de descargarlo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-muted/10 rounded-md overflow-hidden border">
                        {pdfUrl && (
                            <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowPdfDialog(false)}>
                            Cerrar
                        </Button>
                        <Button onClick={() => {
                            if (pdfUrl) {
                                const link = document.createElement('a');
                                link.href = pdfUrl;
                                link.download = `Consulta_${selectedAppointmentId}.pdf`;
                                link.click();
                            }
                        }}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
