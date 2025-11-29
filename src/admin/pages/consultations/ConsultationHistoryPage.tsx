import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllConsultationsAction, getConsultationPdfAction } from "@/clinica/actions/Consultation.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText, Eye, Calendar as CalendarIcon, Download, Pill, FlaskConical } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import type { ConsultationDetailDto } from "@/interfaces/Consultation.response";

export default function ConsultationHistoryPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedConsultation, setSelectedConsultation] = useState<ConsultationDetailDto | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showPdfDialog, setShowPdfDialog] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: consultations, isLoading } = useQuery({
        queryKey: ["all-consultations"],
        queryFn: getAllConsultationsAction,
    });

    const filteredConsultations = consultations?.filter(consultation => {
        const matchesSearch =
            consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (date?.from) {
            const consultationDate = new Date(consultation.createdAt);
            const from = startOfDay(date.from);
            const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
            matchesDate = isWithinInterval(consultationDate, { start: from, end: to });
        }

        return matchesSearch && matchesDate;
    });

    const handleViewDetails = (consultation: ConsultationDetailDto) => {
        setSelectedConsultation(consultation);
        setShowDetailsDialog(true);
    };

    const handleDownloadPdf = async (consultation: ConsultationDetailDto) => {
        try {
            setIsDownloading(true);
            const pdfBlob = await getConsultationPdfAction(consultation.appointmentId);
            const url = window.URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setShowPdfDialog(true);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-sidebar-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Historial de Consultas</h2>
                        <p className="text-muted-foreground">Registro completo de todas las atenciones médicas</p>
                    </div>
                </div>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <CardTitle>Consultas Realizadas</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            {/* Date Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-[260px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "dd/MM/y", { locale: es })} -{" "}
                                                    {format(date.to, "dd/MM/y", { locale: es })}
                                                </>
                                            ) : (
                                                format(date.from, "dd/MM/y", { locale: es })
                                            )
                                        ) : (
                                            <span>Filtrar por fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Search Filter */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por paciente, doctor o diagnóstico..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredConsultations && filteredConsultations.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Diagnóstico</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredConsultations.map((consultation) => (
                                        <TableRow key={consultation.id}>
                                            <TableCell>
                                                {format(new Date(consultation.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">{consultation.patientName}</TableCell>
                                            <TableCell>{consultation.doctorName}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={consultation.diagnosis}>
                                                {consultation.diagnosis || "Sin diagnóstico"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={consultation.isFinalized ? "default" : "secondary"}>
                                                    {consultation.isFinalized ? "Finalizada" : "En Proceso"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(consultation)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver Detalles
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No se encontraron consultas registradas.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* DETAILS MODAL */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Consulta</DialogTitle>
                        <DialogDescription>Resumen completo de la atención médica.</DialogDescription>
                    </DialogHeader>
                    {selectedConsultation && (
                        <>
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-6 py-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                                            <p className="font-semibold">{selectedConsultation.patientName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                                            <p className="font-semibold">{selectedConsultation.doctorName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                                            <p>{format(new Date(selectedConsultation.createdAt), "dd/MM/yyyy hh:mm a")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                            <Badge variant={selectedConsultation.isFinalized ? "default" : "secondary"}>
                                                {selectedConsultation.isFinalized ? "Finalizada" : "En Proceso"}
                                            </Badge>
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
                            <DialogFooter className="flex justify-between items-center border-t pt-4">
                                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Cerrar</Button>
                                <div className="flex gap-2">
                                    {!selectedConsultation.isFinalized && (
                                        <Button onClick={() => navigate(`/dashboard/consultations/process/${selectedConsultation.appointmentId}`)}>
                                            Ir a Consulta
                                        </Button>
                                    )}
                                    <Button onClick={() => handleDownloadPdf(selectedConsultation)} disabled={isDownloading}>
                                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                        Descargar PDF
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
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
        </div>
    );
}
