import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ArrowLeft, Calendar, Stethoscope, FileText,
    Pill, FlaskConical, Download, Eye, Phone, MapPin, Activity,
    Clock,
    Loader2
} from "lucide-react";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { usePatientDetail } from "@/clinica/hooks/usePatient";
import { usePatientHistory } from "@/clinica/hooks/usePatientHistory";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ExamResultDialog } from "@/admin/components/ExamResultDialog";
import { getConsultationPdfAction } from "@/clinica/actions/Consultation.action";
import type { ConsultationDetailDto } from "@/interfaces/Consultation.response";
import type { ExamPendingDto } from "@/interfaces/Laboratory.response";

import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const PatientHistoryPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [selectedConsultation, setSelectedConsultation] = useState<ConsultationDetailDto | null>(null);
    const [selectedExamResult, setSelectedExamResult] = useState<ExamPendingDto | null>(null);

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showPdfDialog, setShowPdfDialog] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);

    // Hooks for data
    const { patient, isLoading: isLoadingPatient } = usePatientDetail(patientId || null);
    const { consultations, exams, isLoadingConsultations, isLoadingExams } = usePatientHistory(Number(patientId) || 0);

    const isLoading = isLoadingPatient || isLoadingConsultations || isLoadingExams;

    const handleViewDetails = (consultation: ConsultationDetailDto) => {
        setSelectedConsultation(consultation);
        setShowDetailsDialog(true);
    };

    const handlePreviewPdf = async (consultation: ConsultationDetailDto) => {
        try {
            setIsDownloading(consultation.id);
            // Use appointmentId as expected by the backend endpoint
            const pdfBlob = await getConsultationPdfAction(consultation.appointmentId);
            const url = window.URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setShowPdfDialog(true);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF");
        } finally {
            setIsDownloading(null);
        }
    };

    const handleExamClick = (exam: ExamPendingDto) => {
        if (exam.statusName === "Completado" || exam.statusId === 2) {
            setSelectedExamResult(exam);
        }
    };

    if (isLoading) return <CustomFullScreenLoading />;

    if (!patient) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2 className="text-2xl font-bold text-muted-foreground">Paciente no encontrado</h2>
            <Button onClick={() => navigate(-1)}>Regresar</Button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Historial Médico</h1>
                    <p className="text-muted-foreground">Expediente Clínico Digital</p>
                </div>
            </div>

            {/* Patient Profile Card */}
            <Card className="border-none shadow-lg bg-linear-to-r from-sidebar-primary/10 via-background to-background overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="h-48 w-48 text-sidebar-primary" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.firstName} ${patient.lastName}`} />
                            <AvatarFallback className="text-2xl bg-sidebar-primary text-primary-foreground">
                                {patient.firstName[0]}{patient.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {patient.firstName} {patient.lastName} {patient.secondLastName}
                                </h2>

                                <Badge variant="outline" className="rounded-full border-sidebar-primary/30 text-sidebar-primary bg-sidebar-primary/5">
                                    ID: {patient.id}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-sidebar-primary" />
                                    <span>{new Date(patient.dateOfBirth).toLocaleDateString()} ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} años)</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4 text-sidebar-primary" />
                                    <span>{patient.contactPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Activity className="h-4 w-4 text-sidebar-primary" />
                                    <span>Tipo de Sangre: <span className="font-semibold text-foreground">{patient.bloodType?.name || "N/A"}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-sidebar-primary" />
                                    <span className="truncate max-w-[200px]" title={patient.address}>{patient.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="timeline" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Línea de Tiempo</TabsTrigger>
                    <TabsTrigger value="consultations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Consultas</TabsTrigger>
                    <TabsTrigger value="exams" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Exámenes</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Recetas</TabsTrigger>
                </TabsList>

                {/* TIMELINE TAB */}
                <TabsContent value="timeline" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card className="border-none shadow-sm bg-transparent">
                        <CardContent className="p-0">
                            {consultations.length === 0 ? (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-muted-foreground">No hay historial de consultas registrado.</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-sidebar-primary/20 ml-4 space-y-8 py-4">
                                    {consultations.map((consultation) => (
                                        <div key={consultation.id} className="relative pl-8 group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[9px] top-6 h-4 w-4 rounded-full bg-background border-4 border-sidebar-primary group-hover:scale-110 transition-transform duration-300" />

                                            <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-sidebar-primary/30 overflow-hidden group-hover:translate-x-1">
                                                <CardHeader className="pb-3 bg-muted/10">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className="bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20">
                                                                    {format(new Date(consultation.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(consultation.createdAt), "hh:mm a")}
                                                                </span>
                                                            </div>
                                                            <CardTitle className="text-lg font-semibold text-foreground">
                                                                {consultation.reason || "Consulta General"}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(consultation)} className="hover:bg-sidebar-primary/10 hover:text-sidebar-primary">
                                                                <Eye className="h-4 w-4 mr-2" /> Ver
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => handlePreviewPdf(consultation)} disabled={isDownloading === consultation.id}>
                                                                {isDownloading === consultation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4 grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                                <Stethoscope className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Atendido por</p>
                                                                <p className="font-medium">{consultation.doctorName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-green-50 rounded-lg text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                                                <Activity className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                                                                <p className="font-medium line-clamp-2">{consultation.diagnosis || "Sin diagnóstico registrado"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 justify-center">
                                                        {consultation.prescriptions.length > 0 && (
                                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 text-sm">
                                                                <Pill className="h-4 w-4" />
                                                                <span className="font-medium">{consultation.prescriptions.reduce((acc, p) => acc + p.items.length, 0)} Medicamentos recetados</span>
                                                            </div>
                                                        )}
                                                        {consultation.exams.length > 0 && (
                                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 text-sm">
                                                                <FlaskConical className="h-4 w-4" />
                                                                <span className="font-medium">{consultation.exams.length} Exámenes solicitados</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONSULTATIONS TAB */}
                <TabsContent value="consultations" className="space-y-4 animate-in fade-in-50 duration-500">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {consultations.map((consultation) => (
                            <Card key={consultation.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => handleViewDetails(consultation)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {format(new Date(consultation.createdAt), "dd/MM/yyyy")}
                                    </CardTitle>
                                    <Stethoscope className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-primary transition-colors" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold truncate" title={consultation.reason}>{consultation.reason}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Dr. {consultation.doctorName}
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        {consultation.diagnosis && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Diagnóstico</Badge>}
                                        {consultation.prescriptions.length > 0 && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Receta</Badge>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* EXAMS TAB */}
                <TabsContent value="exams" className="space-y-4 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Exámenes</CardTitle>
                            <CardDescription>Lista completa de exámenes de laboratorio solicitados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {exams.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No hay exámenes registrados.</div>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className={`p-4 rounded-lg border ${exam.statusName === "Completado" || exam.statusId === 2
                                                ? "bg-green-50 border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                                                : "bg-gray-50 border-gray-100"
                                                }`}
                                            onClick={() => handleExamClick(exam)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-gray-900">{exam.examTypeName}</div>
                                                <Badge variant={
                                                    exam.statusName === "Completado" || exam.statusId === 2 ? "outline" :
                                                        exam.statusName === "Pendiente" ? "secondary" : "secondary"
                                                } className={
                                                    exam.statusName === "Completado" || exam.statusId === 2 ? "bg-green-50 text-green-700 border-green-200" :
                                                        exam.statusName === "Pendiente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""
                                                }>
                                                    {exam.statusName}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-500 flex justify-between">
                                                <span>Ordenado: {new Date(exam.createdAt).toLocaleDateString()}</span>
                                                {(exam.statusName === "Completado" || exam.statusId === 2) && (
                                                    <span className="text-xs text-green-600 font-medium mt-1 block">
                                                        Click para ver resultados
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRESCRIPTIONS TAB */}
                <TabsContent value="prescriptions" className="space-y-4 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Recetas</CardTitle>
                            <CardDescription>Medicamentos recetados en consultas anteriores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-6">
                                    {consultations.filter(c => c.prescriptions.length > 0).map((consultation) => (
                                        <div key={consultation.id} className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 p-2 rounded-md">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(consultation.createdAt), "dd 'de' MMMM, yyyy")} - Dr. {consultation.doctorName}
                                            </div>
                                            <div className="grid gap-3 pl-4 border-l-2 border-orange-200">
                                                {consultation.prescriptions.flatMap(p => p.items).map((item, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                                                <Pill className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-foreground">{item.medicationName}</p>
                                                                <p className="text-sm text-muted-foreground">{item.dose} - {item.frequency}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="mt-2 sm:mt-0 w-fit">{item.duration}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {consultations.every(c => c.prescriptions.length === 0) && (
                                        <div className="text-center py-8 text-muted-foreground">No hay recetas registradas.</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* DETAILS DIALOG */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Consulta</DialogTitle>
                        <DialogDescription>Resumen completo de la atención médica.</DialogDescription>
                    </DialogHeader>
                    {selectedConsultation && (
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                                        <p className="font-semibold">{selectedConsultation.doctorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                                        <p>{format(new Date(selectedConsultation.createdAt), "dd/MM/yyyy hh:mm a")}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
                                        <FileText className="h-4 w-4" /> Diagnóstico y Notas
                                    </h4>
                                    <div className="grid gap-4 pl-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Motivo</p>
                                            <p>{selectedConsultation.reason}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                                            <p className="font-medium text-foreground">{selectedConsultation.diagnosis || "No registrado"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Notas de Tratamiento</p>
                                            <p className="text-sm text-muted-foreground">{selectedConsultation.treatmentNotes || "Sin notas adicionales"}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedConsultation.prescriptions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
                                            <Pill className="h-4 w-4" /> Receta Médica
                                        </h4>
                                        <div className="space-y-2 pl-4">
                                            {selectedConsultation.prescriptions.map((prescription, idx) => (
                                                <div key={idx} className="bg-card border rounded-md p-3 shadow-sm">
                                                    <ul className="space-y-2">
                                                        {prescription.items.map((item, i) => (
                                                            <li key={i} className="text-sm grid grid-cols-1 md:grid-cols-12 gap-2 items-center border-b last:border-0 pb-2 last:pb-0">
                                                                <span className="md:col-span-4 font-medium">{item.medicationName}</span>
                                                                <span className="md:col-span-3 text-muted-foreground">{item.dose}</span>
                                                                <span className="md:col-span-3 text-muted-foreground">{item.frequency}</span>
                                                                <span className="md:col-span-2 text-muted-foreground">{item.duration}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {prescription.notes && <p className="text-xs text-muted-foreground mt-2 italic">Nota: {prescription.notes}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedConsultation.exams.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
                                            <FlaskConical className="h-4 w-4" /> Exámenes Solicitados
                                        </h4>
                                        <div className="bg-card border rounded-md p-3 pl-4 shadow-sm">
                                            <ul className="space-y-2">
                                                {selectedConsultation.exams.map((exam) => (
                                                    <li key={exam.id} className="flex justify-between items-center text-sm">
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
                    )}
                </DialogContent>
            </Dialog>

            {/* PDF PREVIEW DIALOG */}
            <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Vista Previa del Reporte</DialogTitle>
                        <DialogDescription>Puede visualizar el reporte antes de descargarlo.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-muted/10 rounded-md overflow-hidden border">
                        {pdfUrl && <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowPdfDialog(false)}>Cerrar</Button>
                        <Button onClick={() => {
                            if (pdfUrl) {
                                const link = document.createElement('a');
                                link.href = pdfUrl;
                                link.download = `Consulta_${selectedConsultation?.id}.pdf`;
                                link.click();
                            }
                        }}>
                            <Download className="h-4 w-4 mr-2" /> Descargar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Exam Results Dialog */}
            <ExamResultDialog
                exam={selectedExamResult}
                open={!!selectedExamResult}
                onOpenChange={(open) => !open && setSelectedExamResult(null)}
            />
        </div>
    );
};