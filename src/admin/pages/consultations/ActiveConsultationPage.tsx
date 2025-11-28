
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

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
            temp: "", weight: "", height: "", bp: "", hr: "", rr: "", saturation: ""
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
    const onSubmit = (values: ConsultationFormValues) => {
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
                            <div className="flex-1 border-r border-border flex flex-col">
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

                            {/* Sub-panel Derecho: Recetas (Placeholder mejorado) */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-green-600" />
                                        Farmacia / Receta
                                    </h3>
                                    <Button size="sm" variant="outline" disabled>
                                        + Agregar Medicamento
                                    </Button>
                                </div>
                                <div className="flex-1 p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Pill className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p className="font-medium">Módulo de Recetas en Construcción</p>
                                    <p className="text-sm">Próximamente podrás buscar medicamentos y generar recetas PDF.</p>
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
const ExamsList = ({ patientId, currentAppointmentId }: { patientId: number, currentAppointmentId: number }) => {
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


// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";
// import {
//     Loader2, Save, ArrowLeft, AlertTriangle,
//     Activity, Thermometer, Heart, Wind, Scale, Ruler,
//     Stethoscope, Pill, FlaskConical, History
// } from "lucide-react";

// // Hooks y Componentes
// import { useConsultationFlow, useConsultationDetail } from "@/clinica/hooks/useConsultationFlow";
// import { PatientRecord } from "@/clinica/components/PatientRecord"; // Tu componente optimizado
// import { OrderExamDialog } from "@/clinica/components/OrderExamDialog";
// import { usePatientHistory } from "@/clinica/hooks/usePatientHistory";

// // UI Components
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//     AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
//     AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
// } from "@/components/ui/alert-dialog";

// // Schema
// import { consultationSchema, type ConsultationFormValues } from "@/admin/Validation/ConsultationSchema";

// export const ActiveConsultationPage = () => {
//     const { appointmentId } = useParams<{ appointmentId: string }>();
//     const navigate = useNavigate();

//     // Data Hooks
//     const { data: consultation, isLoading: isLoadingDetail } = useConsultationDetail(Number(appointmentId));
//     const { finalizeConsultation, isFinalizing, rollbackConsultation, isRollingBack } = useConsultationFlow();

//     // Estado local para navegación segura
//     const [showExitDialog, setShowExitDialog] = useState(false);

//     // React Hook Form
//     const form = useForm<ConsultationFormValues>({
//         resolver: zodResolver(consultationSchema),
//         defaultValues: {
//             reason: "",
//             physicalExam: "",
//             diagnosis: "",
//             treatmentNotes: "",
//             // Valores iniciales vacíos para signos vitales
//             temp: "", weight: "", height: "", bp: "", hr: "", rr: "", saturation: ""
//         }
//     });

//     // Cargar datos al iniciar
//     useEffect(() => {
//         if (consultation) {
//             form.reset({
//                 reason: consultation.reason || "",
//                 physicalExam: consultation.physicalExam || "", // Si ya hay texto, se carga
//                 diagnosis: consultation.diagnosis || "",
//                 treatmentNotes: consultation.treatmentNotes || "",
//             });
//         }
//     }, [consultation, form]);

//     // ----------------------------------------------------------------------
//     // LÓGICA DE SEGURIDAD (NAVIGATION GUARD)
//     // ----------------------------------------------------------------------

//     // 1. Prevenir cierre de pestaña/navegador
//     useEffect(() => {
//         const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//             if (consultation && !consultation.isFinalized) {
//                 e.preventDefault();
//                 e.returnValue = ""; // Standard browser dialog
//             }
//         };
//         window.addEventListener("beforeunload", handleBeforeUnload);
//         return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//     }, [consultation]);

//     // 2. Interceptar botón "Atrás" o navegación interna
//     const handleSafeExit = () => {
//         if (consultation && !consultation.isFinalized) {
//             setShowExitDialog(true);
//         } else {
//             navigate(-1);
//         }
//     };

//     // 3. Rollback (Cancelar consulta y volver a estado Confirmada)
//     const confirmRollback = () => {
//         if (!consultation) return;
//         rollbackConsultation(consultation.id, {
//             onSuccess: () => {
//                 setShowExitDialog(false);
//                 // El hook useConsultationFlow debería redirigir, si no:
//                 navigate("/dashboard/appointments/today");
//             }
//         });
//     };

//     // ----------------------------------------------------------------------
//     // ENVÍO DE FORMULARIO
//     // ----------------------------------------------------------------------
//     const onSubmit = (values: ConsultationFormValues) => {
//         if (!consultation) return;

//         // Concatenar Signos Vitales al texto del Examen Físico
//         let physicalExamText = values.physicalExam || "";
//         const vitals = [];

//         if (values.weight) vitals.push(`Peso: ${values.weight}kg`);
//         if (values.height) vitals.push(`Talla: ${values.height}cm`);
//         if (values.bp) vitals.push(`P.A: ${values.bp}`);
//         if (values.hr) vitals.push(`F.C: ${values.hr}x'`);
//         if (values.rr) vitals.push(`F.R: ${values.rr}x'`);
//         if (values.temp) vitals.push(`Temp: ${values.temp}°C`);
//         if (values.saturation) vitals.push(`SatO2: ${values.saturation}%`);

//         if (vitals.length > 0) {
//             // Formatear bonito para que quede al inicio del texto
//             const vitalsString = `--- SIGNOS VITALES ---\n${vitals.join(" | ")}\n----------------------\n`;
//             physicalExamText = `${vitalsString}\n${physicalExamText}`;
//         }

//         finalizeConsultation({
//             consultationId: consultation.id,
//             reason: values.reason,
//             physicalExam: physicalExamText,
//             diagnosis: values.diagnosis,
//             treatmentNotes: values.treatmentNotes
//         });
//     };

//     if (isLoadingDetail) return <div className="flex h-screen items-center justify-center bg-muted/20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
//     if (!consultation) return <div className="p-8 text-center text-muted-foreground">No se pudo cargar la información de la consulta.</div>;

//     return (
//         <div className="flex flex-col h-[calc(100vh-1rem)] gap-4 p-2 md:p-4 max-w-[1800px] mx-auto overflow-hidden">

//             {/* --- HEADER --- */}
//             <header className="flex items-center justify-between bg-card px-6 py-3 rounded-xl border shadow-sm shrink-0">
//                 <div className="flex items-center gap-4">
//                     <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleSafeExit}>
//                         <ArrowLeft className="h-5 w-5 text-muted-foreground" />
//                     </Button>
//                     <div className="flex flex-col">
//                         <div className="flex items-center gap-2">
//                             <h1 className="text-xl font-bold text-foreground">{consultation.patientName}</h1>
//                             <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 animate-pulse">
//                                 En Curso
//                             </Badge>
//                         </div>
//                         <p className="text-xs text-muted-foreground flex items-center gap-2">
//                             <span className="font-medium text-foreground">Dr. {consultation.doctorName}</span>
//                             <span>•</span>
//                             <span>Inicio: {format(new Date(consultation.createdAt), "hh:mm a", { locale: es })}</span>
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <Button
//                         variant="destructive"
//                         size="sm"
//                         className="opacity-90 hover:opacity-100"
//                         onClick={handleSafeExit}
//                     >
//                         Cancelar
//                     </Button>
//                     <Button
//                         size="lg"
//                         onClick={form.handleSubmit(onSubmit)}
//                         disabled={isFinalizing}
//                         className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-105"
//                     >
//                         {isFinalizing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
//                         Finalizar Consulta
//                     </Button>
//                 </div>
//             </header>

//             {/* --- MAIN LAYOUT --- */}
//             <div className="flex flex-1 gap-4 overflow-hidden">

//                 {/* --- PANEL IZQUIERDO: EXPEDIENTE --- */}
//                 <aside className="hidden lg:block w-[350px] xl:w-[400px] flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
//                     <div className="p-3 bg-muted/30 border-b font-medium text-sm text-muted-foreground flex items-center gap-2">
//                         <History className="h-4 w-4" />
//                         Historial y Datos del Paciente
//                     </div>
//                     <ScrollArea className="flex-1">
//                         <div className="p-2">
//                             <PatientRecord
//                                 patientId={consultation.patientId}
//                                 patientName={consultation.patientName}
//                             />
//                         </div>
//                     </ScrollArea>
//                 </aside>

//                 {/* --- PANEL DERECHO: ESPACIO DE TRABAJO --- */}
//                 <main className="flex-1 bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
//                     <Tabs defaultValue="medical-act" className="flex-1 flex flex-col h-full">

//                         <div className="px-6 pt-4 border-b bg-muted/5">
//                             <TabsList className="grid w-full max-w-lg grid-cols-2">
//                                 <TabsTrigger value="medical-act" className="gap-2">
//                                     <Stethoscope className="h-4 w-4" /> Acto Médico
//                                 </TabsTrigger>
//                                 <TabsTrigger value="orders" className="gap-2">
//                                     <FlaskConical className="h-4 w-4" /> Órdenes y Recetas
//                                 </TabsTrigger>
//                             </TabsList>
//                         </div>

//                         {/* --- TAB 1: ACTO MÉDICO (SOAP + VITALES) --- */}
//                         <TabsContent value="medical-act" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
//                             <ScrollArea className="flex-1 p-6">
//                                 <div className="max-w-5xl mx-auto space-y-8">

//                                     {/* Sección de Signos Vitales (Visualmente destacada) */}
//                                     <section className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
//                                         <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
//                                             <Activity className="h-4 w-4" /> SIGNOS VITALES
//                                         </h3>
//                                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
//                                             <VitalInput icon={Scale} label="Peso" suffix="kg" name="weight" register={form.register} placeholder="70" />
//                                             <VitalInput icon={Ruler} label="Talla" suffix="cm" name="height" register={form.register} placeholder="170" />
//                                             <VitalInput icon={Thermometer} label="Temp" suffix="°C" name="temp" register={form.register} placeholder="36.5" />
//                                             <VitalInput icon={Activity} label="P.A." suffix="" name="bp" register={form.register} placeholder="120/80" />
//                                             <VitalInput icon={Heart} label="F.C." suffix="bpm" name="hr" register={form.register} placeholder="80" />
//                                             <VitalInput icon={Wind} label="F.R." suffix="rpm" name="rr" register={form.register} placeholder="18" />
//                                             <VitalInput icon={Activity} label="SatO2" suffix="%" name="saturation" register={form.register} placeholder="98" />
//                                         </div>
//                                     </section>

//                                     {/* Sección SOAP */}
//                                     <div className="grid gap-6">
//                                         <div className="space-y-2">
//                                             <Label className="text-base font-semibold text-primary">1. Motivo de Consulta (Subjetivo)</Label>
//                                             <Textarea
//                                                 {...form.register("reason")}
//                                                 placeholder="¿Qué molestias refiere el paciente?"
//                                                 className="min-h-[100px] text-base resize-none focus-visible:ring-primary"
//                                             />
//                                             {form.formState.errors.reason && <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>}
//                                         </div>

//                                         <div className="space-y-2">
//                                             <Label className="text-base font-semibold text-primary">2. Examen Físico (Objetivo)</Label>
//                                             <Textarea
//                                                 {...form.register("physicalExam")}
//                                                 placeholder="Hallazgos físicos relevantes..."
//                                                 className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
//                                             />
//                                         </div>

//                                         <div className="grid md:grid-cols-2 gap-6">
//                                             <div className="space-y-2">
//                                                 <Label className="text-base font-semibold text-primary">3. Diagnóstico (Análisis)</Label>
//                                                 <Textarea
//                                                     {...form.register("diagnosis")}
//                                                     placeholder="Impresión diagnóstica..."
//                                                     className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
//                                                 />
//                                             </div>
//                                             <div className="space-y-2">
//                                                 <Label className="text-base font-semibold text-primary">4. Plan de Tratamiento</Label>
//                                                 <Textarea
//                                                     {...form.register("treatmentNotes")}
//                                                     placeholder="Indicaciones generales, reposo, dieta..."
//                                                     className="min-h-[120px] text-base resize-none focus-visible:ring-primary"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </ScrollArea>
//                         </TabsContent>

//                         {/* --- TAB 2: ÓRDENES (EXÁMENES Y RECETAS) --- */}
//                         <TabsContent value="orders" className="flex-1 p-0 m-0 overflow-hidden flex flex-col md:flex-row">

//                             {/* Sub-panel Izquierdo: Exámenes */}
//                             <div className="flex-1 border-r border-border flex flex-col">
//                                 <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
//                                     <h3 className="font-semibold flex items-center gap-2">
//                                         <FlaskConical className="h-4 w-4 text-purple-600" />
//                                         Laboratorio
//                                     </h3>
//                                     <OrderExamDialog appointmentId={consultation.appointmentId} consultationId={consultation.id} />
//                                 </div>
//                                 <ScrollArea className="flex-1 p-4 bg-muted/5">
//                                     <ExamsList patientId={consultation.patientId} currentAppointmentId={consultation.appointmentId} />
//                                 </ScrollArea>
//                             </div>

//                             {/* Sub-panel Derecho: Recetas (Placeholder mejorado) */}
//                             <div className="flex-1 flex flex-col">
//                                 <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
//                                     <h3 className="font-semibold flex items-center gap-2">
//                                         <Pill className="h-4 w-4 text-green-600" />
//                                         Farmacia / Receta
//                                     </h3>
//                                     <Button size="sm" variant="outline" disabled>
//                                         + Agregar Medicamento
//                                     </Button>
//                                 </div>
//                                 <div className="flex-1 p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
//                                     <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
//                                         <Pill className="h-8 w-8 opacity-50" />
//                                     </div>
//                                     <p className="font-medium">Módulo de Recetas en Construcción</p>
//                                     <p className="text-sm">Próximamente podrás buscar medicamentos y generar recetas PDF.</p>
//                                 </div>
//                             </div>

//                         </TabsContent>
//                     </Tabs>
//                 </main>
//             </div>

//             {/* --- MODAL DE SEGURIDAD --- */}
//             <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
//                 <AlertDialogContent className="max-w-md">
//                     <AlertDialogHeader>
//                         <AlertDialogTitle className="text-destructive flex items-center gap-2">
//                             <AlertTriangle className="h-5 w-5" />
//                             ¿Abandonar consulta?
//                         </AlertDialogTitle>
//                         <AlertDialogDescription className="text-base">
//                             La consulta está en curso. Si sales ahora:
//                             <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-foreground">
//                                 <li>Se perderán los datos no guardados.</li>
//                                 <li>La cita volverá al estado <strong>"Confirmada"</strong> (Sala de espera).</li>
//                             </ul>
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel>Continuar aquí</AlertDialogCancel>
//                         <AlertDialogAction
//                             onClick={confirmRollback}
//                             className="bg-destructive hover:bg-destructive/90"
//                             disabled={isRollingBack}
//                         >
//                             {isRollingBack ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
//                             Sí, salir y cancelar
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>

//         </div>
//     );
// };

// // Componente pequeño para los inputs de vitales
// const VitalInput = ({ icon: Icon, label, suffix, name, register, placeholder }: any) => (
//     <div className="space-y-1.5">
//         <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
//             <Icon className="h-3 w-3" /> {label}
//         </Label>
//         <div className="relative">
//             <Input
//                 {...register(name)}
//                 placeholder={placeholder}
//                 className="h-9 pr-6 text-sm bg-white dark:bg-card"
//             />
//             {suffix && <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground pointer-events-none">{suffix}</span>}
//         </div>
//     </div>
// );

// // Componente para listar exámenes (Simplificado para el ejemplo)
// const ExamsList = ({ patientId, currentAppointmentId }: { patientId: number, currentAppointmentId: number }) => {
//     const { exams, isLoadingExams } = usePatientHistory(patientId);

//     if (isLoadingExams) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;

//     // Filtramos visualmente los recientes (ejemplo simple)
//     const recentExams = exams.length > 0 ? exams : [];

//     return (
//         <div className="space-y-2">
//             {recentExams.length === 0 ? (
//                 <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
//                     <p className="text-sm text-muted-foreground">No se han solicitado exámenes para este paciente.</p>
//                 </div>
//             ) : (
//                 recentExams.map((exam: any) => (
//                     <Card key={exam.id} className="shadow-sm border-l-4 border-l-primary/50">
//                         <CardContent className="p-3 flex justify-between items-center">
//                             <div>
//                                 <p className="font-medium text-sm">{exam.examTypeName}</p>
//                                 <p className="text-xs text-muted-foreground">
//                                     {format(new Date(exam.createdAt), "dd MMM HH:mm", { locale: es })}
//                                 </p>
//                             </div>
//                             <Badge variant={exam.statusId === 2 ? "default" : "secondary"}>
//                                 {exam.statusName}
//                             </Badge>
//                         </CardContent>
//                     </Card>
//                 ))
//             )}
//         </div>
//     );
// };













// // import { Badge } from "@/components/ui/badge";
// // import { useState, useEffect } from "react";
// // import { useParams, useNavigate, useLocation, useBlocker } from "react-router"; // useBlocker might need react-router-dom v6.19+
// // import { useConsultationFlow, useConsultationDetail } from "@/clinica/hooks/useConsultationFlow";
// // import { PatientRecord } from "@/clinica/components/PatientRecord";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Loader2, Save, ArrowLeft, AlertTriangle } from "lucide-react";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { consultationSchema, ConsultationFormValues } from "@/admin/Validation/ConsultationSchema";
// // import { OrderExamDialog } from "@/clinica/components/OrderExamDialog";
// // import { usePatientHistory } from "@/clinica/hooks/usePatientHistory";
// // import { format } from "date-fns";
// // import { es } from "date-fns/locale";
// // import { toast } from "sonner";
// // import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// // export const ActiveConsultationPage = () => {
// //     const { appointmentId } = useParams<{ appointmentId: string }>();
// //     const navigate = useNavigate();
// //     const location = useLocation();
// //     const { data: consultation, isLoading: isLoadingDetail } = useConsultationDetail(Number(appointmentId));
// //     const { finalizeConsultation, isFinalizing, rollbackConsultation, isRollingBack } = useConsultationFlow();

// //     // Form handling
// //     const form = useForm<ConsultationFormValues>({
// //         resolver: zodResolver(consultationSchema),
// //         defaultValues: {
// //             reason: "",
// //             physicalExam: "",
// //             diagnosis: "",
// //             treatmentNotes: "",
// //             temp: "", weight: "", height: "", bp: "", hr: "", rr: "", saturation: ""
// //         }
// //     });

// //     // Populate form when data loads
// //     useEffect(() => {
// //         if (consultation) {
// //             form.reset({
// //                 reason: consultation.reason || "",
// //                 physicalExam: consultation.physicalExam || "",
// //                 diagnosis: consultation.diagnosis || "",
// //                 treatmentNotes: consultation.treatmentNotes || "",
// //                 // Parse vital signs if they were stored in physicalExam?
// //                 // For now, we assume physicalExam is just text.
// //                 // If we wanted to parse back, we'd need a structured format.
// //             });
// //         }
// //     }, [consultation, form]);

// //     // Navigation Blocking
// //     // Note: useBlocker is available in react-router-dom v6.19+. If using older, might need different approach.
// //     // Assuming v6.19+ based on project context.
// //     // We block if the form is dirty OR if we are in an active consultation that hasn't been finalized.
// //     // Actually, we should block if the consultation is NOT finalized.

// //     const [showExitDialog, setShowExitDialog] = useState(false);
// //     const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

// //     // Simple window unload protection
// //     useEffect(() => {
// //         const handleBeforeUnload = (e: BeforeUnloadEvent) => {
// //             if (consultation && !consultation.isFinalized) {
// //                 e.preventDefault();
// //                 e.returnValue = "";
// //             }
// //         };
// //         window.addEventListener("beforeunload", handleBeforeUnload);
// //         return () => window.removeEventListener("beforeunload", handleBeforeUnload);
// //     }, [consultation]);

// //     // Custom back button handler
// //     const handleBack = () => {
// //         if (consultation && !consultation.isFinalized) {
// //             setShowExitDialog(true);
// //         } else {
// //             navigate(-1);
// //         }
// //     };

// //     const handleRollback = () => {
// //         if (!consultation) return;
// //         rollbackConsultation(consultation.id, {
// //             onSuccess: () => {
// //                 setShowExitDialog(false);
// //                 // Navigation handled by hook
// //             }
// //         });
// //     };

// //     const onSubmit = (values: ConsultationFormValues) => {
// //         if (!consultation) return;

// //         // Concatenate vital signs into physicalExam if provided
// //         let physicalExamText = values.physicalExam || "";
// //         const vitals = [];
// //         if (values.temp) vitals.push(`Temp: ${values.temp}°C`);
// //         if (values.weight) vitals.push(`Peso: ${values.weight}kg`);
// //         if (values.height) vitals.push(`Altura: ${values.height}cm`);
// //         if (values.bp) vitals.push(`PA: ${values.bp}`);
// //         if (values.hr) vitals.push(`FC: ${values.hr}bpm`);
// //         if (values.rr) vitals.push(`FR: ${values.rr}rpm`);
// //         if (values.saturation) vitals.push(`SatO2: ${values.saturation}%`);

// //         if (vitals.length > 0) {
// //             physicalExamText = `Signos Vitales:\n${vitals.join(" | ")}\n\nExamen Físico:\n${physicalExamText}`;
// //         }

// //         finalizeConsultation({
// //             consultationId: consultation.id,
// //             reason: values.reason,
// //             physicalExam: physicalExamText,
// //             diagnosis: values.diagnosis,
// //             treatmentNotes: values.treatmentNotes
// //         });
// //     };

// //     if (isLoadingDetail) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
// //     if (!consultation) return <div className="p-8 text-center">Consulta no encontrada</div>;

// //     return (
// //         <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4 max-w-[1600px] mx-auto">
// //             {/* Header */}
// //             <header className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
// //                 <div className="flex items-center gap-4">
// //                     <Button variant="ghost" size="icon" onClick={handleBack}>
// //                         <ArrowLeft className="h-5 w-5" />
// //                     </Button>
// //                     <div>
// //                         <h1 className="text-xl font-bold">{consultation.patientName}</h1>
// //                         <p className="text-sm text-muted-foreground">
// //                             Inicio: {format(new Date(consultation.createdAt), "HH:mm a", { locale: es })} • Dr. {consultation.doctorName}
// //                         </p>
// //                     </div>
// //                 </div>
// //                 <div className="flex items-center gap-2">
// //                     <Button
// //                         onClick={form.handleSubmit(onSubmit)}
// //                         disabled={isFinalizing}
// //                         className="bg-green-600 hover:bg-green-700"
// //                     >
// //                         {isFinalizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
// //                         Finalizar Consulta
// //                     </Button>
// //                 </div>
// //             </header>

// //             <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
// //                 {/* Left Panel: Patient Record */}
// //                 <div className="lg:col-span-4 h-full overflow-hidden">
// //                     <PatientRecord
// //                         patientId={consultation.patientId}
// //                         patientName={consultation.patientName}
// //                     // We could fetch more details if needed
// //                     />
// //                 </div>

// //                 {/* Right Panel: Consultation Tabs */}
// //                 <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
// //                     <Tabs defaultValue="notes" className="h-full flex flex-col">
// //                         <TabsList className="w-full justify-start">
// //                             <TabsTrigger value="notes">Notas Clínicas</TabsTrigger>
// //                             <TabsTrigger value="exams">Exámenes</TabsTrigger>
// //                             <TabsTrigger value="prescriptions">Recetas</TabsTrigger>
// //                         </TabsList>

// //                         <TabsContent value="notes" className="flex-1 overflow-auto p-1">
// //                             <Card className="h-full border-none shadow-none">
// //                                 <CardContent className="h-full space-y-6 p-4">
// //                                     {/* Vital Signs */}
// //                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">Temp (°C)</Label>
// //                                             <Input {...form.register("temp")} placeholder="37.0" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">Peso (kg)</Label>
// //                                             <Input {...form.register("weight")} placeholder="70" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">Altura (cm)</Label>
// //                                             <Input {...form.register("height")} placeholder="170" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">P.A. (mmHg)</Label>
// //                                             <Input {...form.register("bp")} placeholder="120/80" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">F.C. (bpm)</Label>
// //                                             <Input {...form.register("hr")} placeholder="80" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">F.R. (rpm)</Label>
// //                                             <Input {...form.register("rr")} placeholder="16" className="h-8" />
// //                                         </div>
// //                                         <div className="space-y-1">
// //                                             <Label className="text-xs">SatO2 (%)</Label>
// //                                             <Input {...form.register("saturation")} placeholder="98" className="h-8" />
// //                                         </div>
// //                                     </div>

// //                                     {/* SOAP Notes */}
// //                                     <div className="space-y-4">
// //                                         <div className="space-y-2">
// //                                             <Label>Motivo de Consulta / Subjetivo</Label>
// //                                             <Textarea
// //                                                 {...form.register("reason")}
// //                                                 className="min-h-[100px]"
// //                                                 placeholder="Describa los síntomas y motivo de la visita..."
// //                                             />
// //                                             {form.formState.errors.reason && <p className="text-xs text-red-500">{form.formState.errors.reason.message}</p>}
// //                                         </div>

// //                                         <div className="space-y-2">
// //                                             <Label>Examen Físico / Objetivo</Label>
// //                                             <Textarea
// //                                                 {...form.register("physicalExam")}
// //                                                 className="min-h-[100px]"
// //                                                 placeholder="Hallazgos del examen físico..."
// //                                             />
// //                                         </div>

// //                                         <div className="space-y-2">
// //                                             <Label>Diagnóstico / Análisis</Label>
// //                                             <Textarea
// //                                                 {...form.register("diagnosis")}
// //                                                 className="min-h-[80px]"
// //                                                 placeholder="Diagnóstico presuntivo o definitivo..."
// //                                             />
// //                                         </div>

// //                                         <div className="space-y-2">
// //                                             <Label>Plan de Tratamiento</Label>
// //                                             <Textarea
// //                                                 {...form.register("treatmentNotes")}
// //                                                 className="min-h-[100px]"
// //                                                 placeholder="Indicaciones, medicamentos, recomendaciones..."
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 </CardContent>
// //                             </Card>
// //                         </TabsContent>

// //                         <TabsContent value="exams" className="flex-1 overflow-hidden p-1">
// //                             <Card className="h-full border-none shadow-none flex flex-col">
// //                                 <CardHeader className="flex flex-row items-center justify-between py-2">
// //                                     <CardTitle className="text-base">Exámenes Solicitados</CardTitle>
// //                                     <OrderExamDialog appointmentId={consultation.appointmentId} consultationId={consultation.id} />
// //                                 </CardHeader>
// //                                 <CardContent className="flex-1 overflow-auto">
// //                                     <ExamsList patientId={consultation.patientId} currentAppointmentId={consultation.appointmentId} />
// //                                 </CardContent>
// //                             </Card>
// //                         </TabsContent>

// //                         <TabsContent value="prescriptions" className="flex-1 p-1">
// //                             <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg">
// //                                 <p>Módulo de Recetas en desarrollo</p>
// //                             </div>
// //                         </TabsContent>
// //                     </Tabs>
// //                 </div>
// //             </div>

// //             {/* Exit Confirmation Dialog */}
// //             <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
// //                 <AlertDialogContent>
// //                     <AlertDialogHeader>
// //                         <AlertDialogTitle className="flex items-center gap-2 text-destructive">
// //                             <AlertTriangle className="h-5 w-5" />
// //                             Cancelar Consulta
// //                         </AlertDialogTitle>
// //                         <AlertDialogDescription>
// //                             La consulta aún no ha sido finalizada. Si sales ahora, se perderán los datos no guardados y la cita volverá a estado "Confirmada".
// //                             <br /><br />
// //                             ¿Estás seguro de que deseas cancelar y salir?
// //                         </AlertDialogDescription>
// //                     </AlertDialogHeader>
// //                     <AlertDialogFooter>
// //                         <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
// //                         <AlertDialogAction
// //                             onClick={handleRollback}
// //                             className="bg-destructive hover:bg-destructive/90"
// //                             disabled={isRollingBack}
// //                         >
// //                             {isRollingBack ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, Cancelar Consulta"}
// //                         </AlertDialogAction>
// //                     </AlertDialogFooter>
// //                 </AlertDialogContent>
// //             </AlertDialog>
// //         </div>
// //     );
// // };

// // // Helper component to list exams
// // const ExamsList = ({ patientId, currentAppointmentId }: { patientId: number, currentAppointmentId: number }) => {
// //     const { exams, isLoadingExams } = usePatientHistory(patientId);

// //     // Filter to show exams for THIS appointment at the top or highlighted?
// //     // Or just show all. Let's show all but maybe group by date.

// //     if (isLoadingExams) return <Loader2 className="animate-spin" />;

// //     const currentExams = exams.filter(e => e.createdAt.startsWith(new Date().toISOString().split('T')[0])); // Rough check for today/current
// //     // Better: filter by appointmentId if available in DTO. Yes, we added it.
// //     // Wait, ExamPendingDto has appointment info? Yes, but maybe not appointmentId directly on root?
// //     // Let's check ExamPendingDto. It has patientId.
// //     // The backend GetExamsByPatientId returns all.

// //     // Actually, let's just show the list.

// //     return (
// //         <div className="space-y-2">
// //             {exams.length === 0 ? (
// //                 <p className="text-muted-foreground text-sm">No hay exámenes solicitados.</p>
// //             ) : (
// //                 exams.map(exam => (
// //                     <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
// //                         <div>
// //                             <p className="font-medium">{exam.examTypeName}</p>
// //                             <p className="text-xs text-muted-foreground">
// //                                 {format(new Date(exam.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
// //                             </p>
// //                         </div>
// //                         <div className="flex items-center gap-2">
// //                             <Badge variant={exam.statusId === 2 ? "default" : "outline"}>
// //                                 {exam.statusName}
// //                             </Badge>
// //                         </div>
// //                     </div>
// //                 ))
// //             )}
// //         </div>
// //     );
// // };
