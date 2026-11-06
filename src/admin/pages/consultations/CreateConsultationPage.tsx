import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Stethoscope, User as UserIcon } from "lucide-react";
import { PatientHistoryContent } from "@/admin/pages/patients/components/PatientHistoryContent";
import { SearchPatient } from "@/admin/pages/appointments/components/SearchPatient";
import { usePatientDetail } from "@/clinica/hooks/usePatient";
import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";
import { startWalkInConsultationAction } from "@/clinica/actions/Consultation.action";
import { toast } from "sonner";
import { useAuthStore } from "@/auth/store/auth.store";

const translateAppointmentValidationMessage = (message: string) => {
    const normalized = message.trim().toLowerCase();
    const translations: Record<string, string> = {
        "the start time must be within the clinic's business hours.": "La hora actual está fuera del horario de atención de la clínica.",
        "the appointment must start and end within the clinic's business hours on the same day.": "La consulta debe iniciar y finalizar dentro del horario de atención de la clínica.",
        "appointments cannot be scheduled in the past.": "La hora de inicio no puede estar en el pasado.",
        "you must select a patient.": "Selecciona un paciente para continuar.",
        "you must select a doctor.": "Selecciona el médico que atenderá la consulta.",
        "the duration should be between 5 and 150 minutes.": "La duración de la consulta debe estar entre 5 y 150 minutos.",
    };

    return translations[normalized] || message;
};

const getAppointmentValidationMessages = (responseData: any): string[] => {
    const validationErrors = responseData?.validationErrors ?? responseData?.errors;

    if (Array.isArray(validationErrors)) {
        return validationErrors
            .map((error: any) => error?.errorMessage || error?.message)
            .filter(Boolean)
            .map((message: string) => translateAppointmentValidationMessage(message));
    }

    if (validationErrors && typeof validationErrors === "object") {
        return Object.values(validationErrors)
            .flatMap((messages: any) => Array.isArray(messages) ? messages : [messages])
            .filter((message): message is string => typeof message === "string")
            .map(translateAppointmentValidationMessage);
    }

    return [];
};

export default function CreateConsultationPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);

    const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
        return searchParams.get("patientId") || "";
    });
    const [isPatientSelected, setIsPatientSelected] = useState(() => {
        return !!searchParams.get("patientId");
    });
    const [showPatientRecord, setShowPatientRecord] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [isDoctorPickerOpen, setIsDoctorPickerOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load patient details
    const { data: patientDetail, isLoading: isLoadingPatientDetail } = usePatientDetail(
        selectedPatientId ? selectedPatientId : null
    );

    // Load doctors
    const { data: doctors, isLoading: isLoadingDoctors } = useDoctorsAvailability(null);
    const selectedDoctor = doctors?.find((doctor) => doctor.doctorId.toString() === selectedDoctorId);

    // Sync URL params
    useEffect(() => {
        const patientIdFromUrl = searchParams.get("patientId");
        if (patientIdFromUrl && patientIdFromUrl !== selectedPatientId) {
            setSelectedPatientId(patientIdFromUrl);
            setIsPatientSelected(true);
        }
    }, [searchParams, selectedPatientId]);

    // Show record when patient loaded
    useEffect(() => {
        if (patientDetail && !isLoadingPatientDetail && isPatientSelected) {
            setShowPatientRecord(true);
        }
    }, [patientDetail, isLoadingPatientDetail, isPatientSelected]);

    // Reset when patient deselected
    useEffect(() => {
        if (!isPatientSelected) {
            setShowPatientRecord(false);
            setSelectedPatientId("");
            setSelectedDoctorId("");
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("patientId");
            setSearchParams(newParams);
        }
    }, [isPatientSelected, searchParams, setSearchParams]);

    // Try to auto-select current user if they are a doctor
    useEffect(() => {
        const isDoctor = user?.roleId === 3; // 3 is Doctor role
        if (isDoctor && user?.employeeId && doctors) {
            const doctorMatch = doctors.find(d => d.doctorId === user.employeeId);
            if (doctorMatch) {
                setSelectedDoctorId(doctorMatch.doctorId.toString());
            }
        }
    }, [doctors, user]);

    const hasPatientDetail = Boolean(patientDetail);

    const handlePatientChange = useCallback((value: string) => {
        setSelectedPatientId(value);
        if (value) {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set("patientId", value);
            setSearchParams(newParams);
        }
    }, [setSearchParams]);

    const initialPatient = useMemo(() => {
        return patientDetail ? {
            id: patientDetail.id!,
            fullName: `${patientDetail.firstName} ${patientDetail.lastName}`,
            dni: patientDetail.dni || "",
        } : null;
    }, [patientDetail]);

    const handleStartConsultation = async () => {
        if (!selectedPatientId || !selectedDoctorId) {
            toast.error("Por favor seleccione un paciente y un doctor");
            return;
        }

        setIsProcessing(true);
        try {
            const result = await startWalkInConsultationAction({
                patientId: Number(selectedPatientId),
                employeeId: Number(selectedDoctorId)
            });

            toast.success("Consulta iniciada exitosamente");
            void queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            void queryClient.invalidateQueries({ queryKey: ["appointments"] });
            navigate(`/dashboard/consultations/process/${result.appointmentId}`);

        } catch (error: any) {
            console.error("Error starting consultation:", error);
            const responseData = error?.response?.data ?? error;
            const errorMessage = responseData?.message || responseData?.description || error.message || "Error al iniciar la consulta.";
            const validationMessages = getAppointmentValidationMessages(responseData);
            const errorDescription = responseData?.description || error?.message;

            // Handle specific overlap error
            if (errorDescription === "The patient already has an appointment at that time." || errorDescription === "El paciente ya tiene una cita activa o programada en este horario.") {
                toast.error("El paciente ya tiene una cita activa o programada en este horario.", {
                    description: "Por favor revise la lista de citas del día para iniciar la consulta existente."
                });
                return;
            }

            if (validationMessages.length > 0) {
                toast.error("No se pudo iniciar la consulta", {
                    description: validationMessages.map((message) => `• ${message}`).join("\n"),
                    style: { whiteSpace: 'pre-line' }
                });
            } else {
                toast.error(errorMessage === "Validation Problem" ? "No se pudo validar la cita." : errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-screen-2xl space-y-6 pb-10">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-primary">Atención ambulatoria</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Nueva consulta</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Selecciona al paciente, revisa su expediente y asigna al médico.</p>
                    </div>
                </div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                    <span className={`rounded-full px-2.5 py-1 ${!isPatientSelected ? "bg-sidebar-primary/10 font-medium text-sidebar-primary" : "bg-muted"}`}>1 · Paciente</span>
                    <span aria-hidden="true">/</span>
                    <span className={`rounded-full px-2.5 py-1 ${isPatientSelected ? "bg-sidebar-primary/10 font-medium text-sidebar-primary" : "bg-muted"}`}>2 · Expediente y médico</span>
                </div>
            </header>

            {!isPatientSelected && (
                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
                    <section aria-labelledby="patient-search-heading" className="min-w-0">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle id="patient-search-heading" className="flex items-center gap-2 text-lg">
                                    <UserIcon className="h-5 w-5 text-sidebar-primary" />
                                    Buscar paciente
                                </CardTitle>
                                <CardDescription>Busca por nombre o DNI y selecciona el expediente correcto.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SearchPatient
                                    presentation="workspace"
                                    isPatientSelected={setIsPatientSelected}
                                    setValue={(_, value) => handlePatientChange(value as string)}
                                    initialPatient={initialPatient}
                                />
                            </CardContent>
                        </Card>
                    </section>

                    <aside className="space-y-5 border-l border-border/70 pl-6 pt-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-primary">Flujo de atención</p>
                            <h3 className="mt-2 text-lg font-semibold tracking-tight">Antes de iniciar</h3>
                        </div>
                        <ol className="space-y-5">
                            {[
                                ["01", "Identifica al paciente", "Confirma el nombre y el DNI antes de abrir el expediente."],
                                ["02", "Revisa sus antecedentes", "Consulta alergias, consultas previas y exámenes registrados."],
                                ["03", "Asigna al médico", "Selecciona al profesional para iniciar la atención inmediata."],
                            ].map(([number, title, description]) => (
                                <li key={number} className="flex gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sidebar-primary/25 text-xs font-semibold text-sidebar-primary">{number}</span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{title}</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </aside>
                </div>
            )}

            {isPatientSelected && !isLoadingPatientDetail && (
                <section aria-labelledby="selected-patient-heading" className="min-w-0">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <UserIcon className="h-4 w-4 text-sidebar-primary" />
                        <h3 id="selected-patient-heading">Paciente seleccionado</h3>
                    </div>
                    <SearchPatient
                        presentation="workspace"
                        isPatientSelected={setIsPatientSelected}
                        setValue={(_, value) => handlePatientChange(value as string)}
                        initialPatient={initialPatient}
                        disabled={isLoadingPatientDetail}
                    />
                </section>
            )}

            {isLoadingPatientDetail && isPatientSelected && (
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-5 py-4 text-sm text-muted-foreground animate-in fade-in">
                    <Loader2 className="h-5 w-5 animate-spin text-sidebar-primary" />
                    Cargando expediente del paciente...
                </div>
            )}

            {showPatientRecord && hasPatientDetail && !isLoadingPatientDetail && (
                <div className="grid min-w-0 items-start gap-6 animate-in fade-in duration-300 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="min-w-0" aria-label="Expediente del paciente">
                        <PatientHistoryContent patientId={Number(selectedPatientId)} />
                    </section>

                    <aside className="xl:sticky xl:top-6">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader className="pb-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-primary">Atención inmediata · 30 min</p>
                                <CardTitle className="pt-1 text-lg">Iniciar consulta</CardTitle>
                                <CardDescription>Asigna al médico que atenderá al paciente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label id="doctor-select-label">Médico tratante</Label>
                                    <Popover open={isDoctorPickerOpen} onOpenChange={setIsDoctorPickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="doctor-select"
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isDoctorPickerOpen}
                                                aria-labelledby="doctor-select-label"
                                                disabled={isLoadingDoctors || (user?.roleId === 3 && !!selectedDoctorId) || !doctors?.length}
                                                className="h-auto min-h-11 w-full justify-between gap-3 bg-background px-3 py-2 text-left font-normal"
                                            >
                                                {isLoadingDoctors ? (
                                                    <span className="text-muted-foreground">Cargando médicos...</span>
                                                ) : selectedDoctor ? (
                                                    <span className="flex min-w-0 flex-col">
                                                        <span className="truncate font-medium text-foreground">{selectedDoctor.fullName}</span>
                                                        <span className="truncate text-xs text-muted-foreground">{selectedDoctor.specialtyName}</span>
                                                    </span>
                                                ) : (
                                                    <span className="truncate text-muted-foreground">Buscar por nombre o especialidad</span>
                                                )}
                                                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Escribe un nombre o especialidad..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontraron médicos.</CommandEmpty>
                                                    <CommandGroup heading="Médicos">
                                                        {doctors?.map((doctor) => {
                                                            const doctorId = doctor.doctorId.toString();
                                                            const isSelected = doctorId === selectedDoctorId;
                                                            return (
                                                                <CommandItem
                                                                    key={doctor.doctorId}
                                                                    value={`${doctor.fullName} ${doctor.specialtyName}`}
                                                                    onSelect={() => {
                                                                        setSelectedDoctorId(doctorId);
                                                                        setIsDoctorPickerOpen(false);
                                                                    }}
                                                                    className="min-h-14 gap-3 px-3 py-2"
                                                                >
                                                                    <span className="flex min-w-0 flex-1 flex-col">
                                                                        <span className="truncate font-medium">{doctor.fullName}</span>
                                                                        <span className="truncate text-xs text-muted-foreground">{doctor.specialtyName}</span>
                                                                    </span>
                                                                    <span className={`shrink-0 text-xs ${doctor.isAvailable ? "text-sidebar-primary" : "text-muted-foreground"}`}>
                                                                        {doctor.isAvailable ? "Disponible" : doctor.nextAppointmentDisplay || "Con agenda"}
                                                                    </span>
                                                                    <Check className={`h-4 w-4 shrink-0 text-sidebar-primary ${isSelected ? "opacity-100" : "opacity-0"}`} />
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {!isLoadingDoctors && !doctors?.length && (
                                        <p className="text-xs text-muted-foreground">No hay médicos disponibles para iniciar la atención.</p>
                                    )}
                                </div>

                                <div className="border-t border-border/70 pt-4">
                                    <Button
                                        size="lg"
                                        className="w-full font-semibold disabled:border disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 dark:disabled:bg-background dark:disabled:text-muted-foreground"
                                        onClick={handleStartConsultation}
                                        disabled={!selectedDoctorId || isProcessing || isLoadingDoctors}
                                    >
                                        {isProcessing ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando...</>
                                        ) : (
                                            <><Stethoscope className="mr-2 h-4 w-4" />Iniciar consulta</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            )}
        </div>
    );
}
