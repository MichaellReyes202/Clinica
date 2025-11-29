
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Loader2, Save, ArrowLeft, AlertTriangle,
    Activity, Thermometer, Heart, Wind, Scale, Ruler,
    Stethoscope, Pill, FlaskConical, History
} from "lucide-react";

// Hooks y Componentes
import { useConsultationFlow, useConsultationDetail } from "@/clinica/hooks/useConsultationFlow";
import { PatientRecord } from "@/clinica/components/PatientRecord"; // Tu componente optimizado
import { OrderExamDialog } from "@/clinica/components/OrderExamDialog";
import { usePatientHistory } from "@/clinica/hooks/usePatientHistory";
import { PrescriptionPanel } from "@/clinica/components/PrescriptionPanel";
import { usePrescriptions } from "@/clinica/hooks/usePrescriptions";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Schema
import { consultationSchema, type ConsultationFormValues } from "@/admin/Validation/ConsultationSchema";

export const ActiveConsultationPage = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    // Data Hooks
    const { data: consultation, isLoading: isLoadingDetail } = useConsultationDetail(Number(appointmentId));
    const { finalizeConsultation, isFinalizing, rollbackConsultation, isRollingBack } = useConsultationFlow();
    const { createPrescription } = usePrescriptions(); // Import hook

    // Estado local para navegación segura
    const [showExitDialog, setShowExitDialog] = useState(false);

    // React Hook Form
    const form = useForm<ConsultationFormValues>({
        resolver: zodResolver(consultationSchema),
        defaultValues: {
            reason: "",
            physicalExam: "",
            diagnosis: "",
            treatmentNotes: "",
            // Valores iniciales vacíos para signos vitales
            temp: "", weight: "", height: "", bp: "", hr: "", rr: "", saturation: "",
            // Prescription
            prescriptionItems: [],
            prescriptionNotes: ""
        }
    });

    // Cargar datos al iniciar
    useEffect(() => {
        if (consultation) {
            form.reset({
                reason: consultation.reason || "",
                physicalExam: consultation.physicalExam || "", // Si ya hay texto, se carga
                diagnosis: consultation.diagnosis || "",
                treatmentNotes: consultation.treatmentNotes || "",
                prescriptionItems: [],
                prescriptionNotes: ""
            });
        }
    }, [consultation, form]);

    // ----------------------------------------------------------------------
    // LÓGICA DE SEGURIDAD (NAVIGATION GUARD)
    // ----------------------------------------------------------------------

    // 1. Prevenir cierre de pestaña/navegador
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (consultation && !consultation.isFinalized) {
                e.preventDefault();
                e.returnValue = ""; // Standard browser dialog
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [consultation]);

    // 2. Interceptar botón "Atrás" o navegación interna
    const handleSafeExit = () => {
        if (consultation && !consultation.isFinalized) {
            setShowExitDialog(true);
        } else {
            navigate(-1);
        }
    };

    // 3. Rollback (Cancelar consulta y volver a estado Confirmada)
    const confirmRollback = () => {
        if (!consultation) return;
        rollbackConsultation(consultation.id, {
            onSuccess: () => {
                setShowExitDialog(false);
                // El hook useConsultationFlow debería redirigir, si no:
                navigate("/dashboard/appointments/today");
            }
        });
    };

    // ----------------------------------------------------------------------
    // ENVÍO DE FORMULARIO
    // ----------------------------------------------------------------------
    const onSubmit = async (values: ConsultationFormValues) => {
        if (!consultation) return;

        // Concatenar Signos Vitales al texto del Examen Físico
        let physicalExamText = values.physicalExam || "";
        const vitals = [];

        if (values.weight) vitals.push(`Peso: ${values.weight}kg`);
        if (values.height) vitals.push(`Talla: ${values.height}cm`);
        if (values.bp) vitals.push(`P.A: ${values.bp}`);
        if (values.hr) vitals.push(`F.C: ${values.hr}x'`);
        if (values.rr) vitals.push(`F.R: ${values.rr}x'`);
        if (values.temp) vitals.push(`Temp: ${values.temp}°C`);
        if (values.saturation) vitals.push(`SatO2: ${values.saturation}%`);

        if (vitals.length > 0) {
            // Formatear bonito para que quede al inicio del texto
            const vitalsString = `--- SIGNOS VITALES ---\n${vitals.join(" | ")}\n----------------------\n`;
            physicalExamText = `${vitalsString}\n${physicalExamText}`;
        }

        // 1. Save Prescription if items exist
        if (values.prescriptionItems && values.prescriptionItems.length > 0) {
            try {
                await createPrescription({
                    consultationId: consultation.id,
                    notes: values.prescriptionNotes,
                    items: values.prescriptionItems
                });
            } catch (error) {
                console.error("Error creating prescription:", error);
                return; // Stop finalization if prescription fails
            }
        }

        // 2. Finalize Consultation
        finalizeConsultation({
            consultationId: consultation.id,
            reason: values.reason,
            physicalExam: physicalExamText,
            diagnosis: values.diagnosis,
            treatmentNotes: values.treatmentNotes
        });
    };

    if (isLoadingDetail) return <div className="flex h-screen items-center justify-center bg-muted/20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    if (!consultation) return <div className="p-8 text-center text-muted-foreground">No se pudo cargar la información de la consulta.</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-1rem)] gap-4 p-2 md:p-4 max-w-[1800px] mx-auto overflow-hidden">

            {/* --- HEADER --- */}
            <header className="flex items-center justify-between bg-card px-6 py-3 rounded-xl border shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleSafeExit}>
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-foreground">{consultation.patientName}</h1>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 animate-pulse">
                                En Curso
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground">Dr. {consultation.doctorName}</span>
                            <span>•</span>
                            <span>Inicio: {format(new Date(consultation.createdAt), "hh:mm a", { locale: es })}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="opacity-90 hover:opacity-100"
                        onClick={handleSafeExit}
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="lg"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isFinalizing}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-105"
                    >
                        {isFinalizing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                        Finalizar Consulta
                    </Button>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <div className="flex flex-1 gap-4 overflow-hidden">

                {/* --- PANEL IZQUIERDO: EXPEDIENTE --- */}
                <aside className="hidden lg:block w-[350px] xl:w-[400px] flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-3 bg-muted/30 border-b font-medium text-sm text-muted-foreground flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historial y Datos del Paciente
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2">
                            <PatientRecord
                                patientId={consultation.patientId}
                                patientName={consultation.patientName}
                            />
                        </div>
                    </ScrollArea>
                </aside>

                {/* --- PANEL DERECHO: ESPACIO DE TRABAJO --- */}
                <main className="flex-1 bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
                    <Tabs defaultValue="medical-act" className="flex-1 flex flex-col h-full">

                        <div className="px-6 pt-4 border-b bg-muted/5">
                            <TabsList className="grid w-full max-w-lg grid-cols-2">
                                <TabsTrigger value="medical-act" className="gap-2">
                                    <Stethoscope className="h-4 w-4" /> Acto Médico
                                </TabsTrigger>
                                <TabsTrigger value="orders" className="gap-2">
                                    <FlaskConical className="h-4 w-4" /> Órdenes y Recetas
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- TAB 1: ACTO MÉDICO (SOAP + VITALES) --- */}
                        <TabsContent value="medical-act" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                            <ScrollArea className="flex-1 p-6">
                                <div className="max-w-5xl mx-auto space-y-8">

                                    {/* Sección de Signos Vitales (Visualmente destacada) */}
                                    <section className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> SIGNOS VITALES
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                            <VitalInput icon={Scale} label="Peso" suffix="kg" name="weight" register={form.register} placeholder="70" />
                                            <VitalInput icon={Ruler} label="Talla" suffix="cm" name="height" register={form.register} placeholder="170" />
                                            <VitalInput icon={Thermometer} label="Temp" suffix="°C" name="temp" register={form.register} placeholder="36.5" />
                                            <VitalInput icon={Activity} label="P.A." suffix="" name="bp" register={form.register} placeholder="120/80" />
                                            <VitalInput icon={Heart} label="F.C." suffix="bpm" name="hr" register={form.register} placeholder="80" />
                                            <VitalInput icon={Wind} label="F.R." suffix="rpm" name="rr" register={form.register} placeholder="18" />
                                            <VitalInput icon={Activity} label="SatO2" suffix="%" name="saturation" register={form.register} placeholder="98" />
                                        </div>
                                    </section>

                                    {/* Sección SOAP */}
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold text-primary">1. Motivo de Consulta (Subjetivo)</Label>
                                            <Textarea
                                                {...form.register("reason")}
                                                placeholder="¿Qué molestias refiere el paciente?"
                                                className="min-h-[100px] text-base resize-none focus-visible:ring-primary"
                                            />
                                            {form.formState.errors.reason && <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold text-primary">2. Examen Físico (Objetivo)</Label>
                                            <Textarea
                                                {...form.register("physicalExam")}
                                                placeholder="Hallazgos físicos relevantes..."
                                                className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-base font-semibold text-primary">3. Diagnóstico (Análisis)</Label>
                                                <Textarea
                                                    {...form.register("diagnosis")}
                                                    placeholder="Impresión diagnóstica..."
                                                    className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-base font-semibold text-primary">4. Plan de Tratamiento</Label>
                                                <Textarea
                                                    {...form.register("treatmentNotes")}
                                                    placeholder="Indicaciones generales, reposo, dieta..."
                                                    className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* --- TAB 2: ÓRDENES (EXÁMENES Y RECETAS) --- */}
                        <TabsContent value="orders" className="flex-1 p-0 m-0 overflow-hidden flex flex-col md:flex-row">

                            {/* Sub-panel Izquierdo: Exámenes */}
                            <div className="w-full md:w-[350px] shrink-0 border-r border-border flex flex-col">
                                <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <FlaskConical className="h-4 w-4 text-purple-600" />
                                        Laboratorio
                                    </h3>
                                    <OrderExamDialog appointmentId={consultation.appointmentId} consultationId={consultation.id} />
                                </div>
                                <ScrollArea className="flex-1 p-4 bg-muted/5">
                                    <ExamsList patientId={consultation.patientId} currentAppointmentId={consultation.appointmentId} />
                                </ScrollArea>
                            </div>

                            {/* Sub-panel Derecho: Recetas */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-green-600" />
                                        Farmacia / Receta
                                    </h3>
                                </div>
                                <div className="flex-1 p-4 bg-muted/5 overflow-auto">
                                    <PrescriptionPanel consultationId={consultation.id} form={form} />
                                </div>
                            </div>

                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* --- MODAL DE SEGURIDAD --- */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            ¿Abandonar consulta?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            La consulta está en curso. Si sales ahora:
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-foreground">
                                <li>Se perderán los datos no guardados.</li>
                                <li>La cita volverá al estado <strong>"Confirmada"</strong> (Sala de espera).</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar aquí</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRollback}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isRollingBack}
                        >
                            {isRollingBack ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sí, salir y cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
};

// Componente pequeño para los inputs de vitales
const VitalInput = ({ icon: Icon, label, suffix, name, register, placeholder }: any) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Icon className="h-3 w-3" /> {label}
        </Label>
        <div className="relative">
            <Input
                {...register(name)}
                placeholder={placeholder}
                className="h-9 pr-6 text-sm bg-white dark:bg-card"
            />
            {suffix && <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground pointer-events-none">{suffix}</span>}
        </div>
    </div>
);

// Componente para listar exámenes (Simplificado para el ejemplo)
const ExamsList = ({ patientId }: { patientId: number, currentAppointmentId: number }) => {
    const { exams, isLoadingExams } = usePatientHistory(patientId);

    if (isLoadingExams) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;

    // Filtramos visualmente los recientes (ejemplo simple)
    const recentExams = exams.length > 0 ? exams : [];

    return (
        <div className="space-y-2">
            {recentExams.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">No se han solicitado exámenes para este paciente.</p>
                </div>
            ) : (
                recentExams.map((exam: any) => (
                    <Card key={exam.id} className="shadow-sm border-l-4 border-l-primary/50">
                        <CardContent className="p-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">{exam.examTypeName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(exam.createdAt), "dd MMM HH:mm", { locale: es })}
                                </p>
                            </div>
                            <Badge variant={exam.statusId === 2 ? "default" : "secondary"}>
                                {exam.statusName}
                            </Badge>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};


