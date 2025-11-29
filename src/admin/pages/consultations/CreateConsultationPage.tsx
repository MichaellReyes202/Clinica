import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Stethoscope, User as UserIcon } from "lucide-react";
import { PatientHistoryContent } from "@/admin/pages/patients/components/PatientHistoryContent";
import { SearchPatient } from "@/admin/pages/appointments/components/SearchPatient";
import { usePatientDetail } from "@/clinica/hooks/usePatient";
import { useDoctorsAvailability } from "@/clinica/hooks/useAppointments";
import { createAppointmentAction, updateAppointmentStatusAction } from "@/clinica/actions/Appointments.action";
import { startConsultationAction } from "@/clinica/actions/Consultation.action";
import { toast } from "sonner";
import { useAuthStore } from "@/auth/store/auth.store";

export default function CreateConsultationPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
        return searchParams.get("patientId") || "";
    });
    const [isPatientSelected, setIsPatientSelected] = useState(() => {
        return !!searchParams.get("patientId");
    });
    const [showPatientRecord, setShowPatientRecord] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Load patient details
    const { data: patientDetail, isLoading: isLoadingPatientDetail } = usePatientDetail(
        selectedPatientId ? selectedPatientId : null
    );

    // Load doctors
    const { data: doctors, isLoading: isLoadingDoctors } = useDoctorsAvailability(null);

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

    const mockPatient = patientDetail ? {
        id: patientDetail.id?.toString() || "",
        fullName: `${patientDetail.firstName} ${patientDetail.lastName}`,
        age: patientDetail.dateOfBirth
            ? (new Date().getFullYear() - new Date(patientDetail.dateOfBirth).getFullYear()).toString()
            : "",
        bloodType: patientDetail.bloodType?.name || "Desconocido",
        allergies: patientDetail.allergies,
        phone: patientDetail.contactPhone,
        email: patientDetail.contactEmail,
    } : null;

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
        let appointmentId: number | null = null;
        try {
            // 1. Create Appointment (Scheduled)
            appointmentId = await createAppointmentAction({
                patientId: Number(selectedPatientId),
                employeeId: Number(selectedDoctorId),
                // Send local time as ISO string without 'Z' so backend interprets it as local
                startTime: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, -1),
                duration: 30, // Default duration
                reason: "Consulta sin cita previa (Walk-in)"
            });

            // 2. Confirm Appointment (Status 2)
            await updateAppointmentStatusAction({
                AppointmenId: appointmentId,
                StatusId: 2 // Confirmed
            });

            // 3. Start Consultation
            await startConsultationAction({
                appointmentId: appointmentId
            });

            toast.success("Consulta iniciada exitosamente");

            // 4. Redirect to Active Consultation Page
            // Note: ActiveConsultationPage uses appointmentId in URL
            navigate(`/dashboard/consultations/process/${appointmentId}`);

        } catch (error: any) {
            console.error("Error starting consultation:", error);

            // Rollback: If appointment was created but consultation failed, cancel the appointment
            // We can reuse updateAppointmentStatusAction to set it to Cancelled (5) or Deleted (if we had an action)
            // For now, let's set it to Cancelled (5) so it doesn't show up as "Confirmed"
            if (appointmentId) {
                try {
                    await updateAppointmentStatusAction({
                        AppointmenId: appointmentId,
                        StatusId: 5 // Cancelled
                    });
                    console.log("Rolled back appointment to Cancelled status");
                } catch (rollbackError) {
                    console.error("Failed to rollback appointment:", rollbackError);
                }
            }

            if (error.response?.data) {
                console.log("Full error response:", JSON.stringify(error.response.data, null, 2));
            }
            const errorMessage = error.response?.data?.message || error.message || "Error al iniciar la consulta.";
            const validationErrors = error.response?.data?.errors;
            const errorDescription = error.response?.data?.description;

            // Handle specific overlap error
            if (errorDescription === "The patient already has an appointment at that time.") {
                toast.error("El paciente ya tiene una cita activa o programada en este horario.", {
                    description: "Por favor revise la lista de citas del día para iniciar la consulta existente."
                });
                return;
            }

            if (validationErrors && Array.isArray(validationErrors)) {
                // Fix hydration error: Don't render UL inside toast if toast uses P
                // Instead, join errors with newlines
                const errorList = validationErrors.map((err: any) => `• ${err.propertyName}: ${err.errorMessage}`).join("\n");
                toast.error("Error de validación", {
                    description: errorList,
                    style: { whiteSpace: 'pre-line' }
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Nueva Consulta</h2>
                    <p className="text-muted-foreground">Inicie una consulta inmediata para un paciente</p>
                </div>
            </div>

            {/* Patient Selection */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        Selección de Paciente
                    </CardTitle>
                    <CardDescription>Busque y seleccione el paciente para la consulta</CardDescription>
                </CardHeader>
                <CardContent>
                    <SearchPatient
                        isPatientSelected={setIsPatientSelected}
                        setValue={(_, value) => handlePatientChange(value as string)}
                        initialPatient={initialPatient}
                    />
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoadingPatientDetail && isPatientSelected && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground animate-in fade-in">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Cargando expediente del paciente...</p>
                </div>
            )}

            {/* Patient Record & Action */}
            {showPatientRecord && mockPatient && !isLoadingPatientDetail && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <PatientHistoryContent patientId={Number(selectedPatientId)} />

                    <Card className="border-primary/20 shadow-md bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-primary">Iniciar Atención</CardTitle>
                            <CardDescription>Seleccione el médico y comience la consulta</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="doctor-select">Médico Tratante</Label>
                                <Select
                                    value={selectedDoctorId}
                                    onValueChange={setSelectedDoctorId}
                                    disabled={isLoadingDoctors || (user?.roleId === 3 && !!selectedDoctorId)}
                                >
                                    <SelectTrigger id="doctor-select" className="bg-background">
                                        <SelectValue placeholder={isLoadingDoctors ? "Cargando doctores..." : "Seleccione un doctor"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors?.map((doctor) => (
                                            <SelectItem key={doctor.doctorId} value={doctor.doctorId.toString()}>
                                                {doctor.fullName} - {doctor.specialtyName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/20"
                                    onClick={handleStartConsultation}
                                    disabled={!selectedDoctorId || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Iniciando...
                                        </>
                                    ) : (
                                        <>
                                            <Stethoscope className="mr-2 h-4 w-4" />
                                            Iniciar Consulta Ahora
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
