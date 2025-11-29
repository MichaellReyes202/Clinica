import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePatientHistory } from "../hooks/usePatientHistory";
import { Loader2, FileText, FlaskConical, User, Pill } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PatientRecordProps {
    patientId: number;
    patientName: string;
    patientAge?: number; // Optional if not available immediately
    patientGender?: string;
}

export const PatientRecord = ({ patientId, patientName, patientAge, patientGender }: PatientRecordProps) => {
    const { consultations, exams, isLoadingConsultations, isLoadingExams } = usePatientHistory(patientId);

    if (isLoadingConsultations || isLoadingExams) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <Card className="bg-muted/20 border-none shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {patientName}
                    </CardTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        {patientAge && <span>{patientAge} años</span>}
                        {patientGender && <span>• {patientGender}</span>}
                    </div>
                </CardHeader>
            </Card>

            <ScrollArea className="flex-1 pr-4">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="consultations">
                        <AccordionTrigger className="text-sm font-semibold">
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Historial de Consultas ({consultations.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 pl-2">
                                {consultations.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay consultas previas.</p>
                                ) : (
                                    consultations.map((cons) => (
                                        <div key={cons.id} className="border-l-2 border-primary/20 pl-3 pb-2">
                                            <p className="text-xs font-semibold text-primary">
                                                {format(new Date(cons.createdAt), "dd MMM yyyy", { locale: es })}
                                            </p>
                                            <p className="text-xs font-medium">{cons.reason}</p>
                                            {cons.diagnosis && (
                                                <p className="text-xs text-muted-foreground mt-1">Dx: {cons.diagnosis}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="exams">
                        <AccordionTrigger className="text-sm font-semibold">
                            <span className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" />
                                Exámenes de Laboratorio ({exams.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 pl-2">
                                {exams.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay exámenes registrados.</p>
                                ) : (
                                    exams.map((exam) => (
                                        <div key={exam.id} className="border-l-2 border-blue-400/20 pl-3 pb-2">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-semibold text-blue-600">
                                                    {format(new Date(exam.createdAt), "dd MMM yyyy", { locale: es })}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1">
                                                    {exam.statusName}
                                                </Badge>
                                            </div>
                                            <p className="text-xs font-medium">{exam.examTypeName}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="prescriptions">
                        <AccordionTrigger className="text-sm font-semibold">
                            <span className="flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Historial de Recetas
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 pl-2">
                                <p className="text-xs text-muted-foreground">Funcionalidad de historial de recetas en desarrollo.</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </div>
    );
};
