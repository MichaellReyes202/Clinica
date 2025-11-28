import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Loader2 } from "lucide-react";
import { PatientRecord } from "@/admin/components/PatientRecord";
import { SearchPatient } from "@/admin/pages/appointments/components/SearchPatient";
import { usePatientDetail } from "@/clinica/hooks/usePatient";

export default function CreateConsultationPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
        // Inicializar con el patientId de la URL si existe
        return searchParams.get("patientId") || "";
    });
    const [isPatientSelected, setIsPatientSelected] = useState(() => {
        // Si hay patientId en la URL, marcar como seleccionado
        return !!searchParams.get("patientId");
    });
    const [showPatientRecord, setShowPatientRecord] = useState(false);

    // Hook para cargar los detalles del paciente
    const { data: patientDetail, isLoading: isLoadingPatientDetail } = usePatientDetail(
        selectedPatientId ? selectedPatientId : null
    );

    const [consultationData, setConsultationData] = useState({
        reason: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        notes: "",
    });

    // Cargar paciente desde URL al montar el componente
    useEffect(() => {
        const patientIdFromUrl = searchParams.get("patientId");
        if (patientIdFromUrl && patientIdFromUrl !== selectedPatientId) {
            setSelectedPatientId(patientIdFromUrl);
            setIsPatientSelected(true);
        }
    }, []);

    // Cuando se carga el paciente exitosamente, mostrar el expediente
    useEffect(() => {
        if (patientDetail && !isLoadingPatientDetail && isPatientSelected) {
            setShowPatientRecord(true);
        }
    }, [patientDetail, isLoadingPatientDetail, isPatientSelected]);

    // Cuando se hace clic en "Cambiar", ocultar el expediente y limpiar URL
    useEffect(() => {
        if (!isPatientSelected) {
            setShowPatientRecord(false);
            setSelectedPatientId("");
            // Limpiar patientId de la URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("patientId");
            setSearchParams(newParams);
        }
    }, [isPatientSelected]);

    const mockPatient = patientDetail ? {
        id: patientDetail.id?.toString(),
        fullName: `${patientDetail.firstName} ${patientDetail.lastName}`,
        age: patientDetail.dateOfBirth
            ? new Date().getFullYear() - new Date(patientDetail.dateOfBirth).getFullYear()
            : "",
        bloodType: "O+", // TODO: mapear del bloodTypeId
        allergies: patientDetail.allergies,
        phone: patientDetail.contactPhone,
        email: patientDetail.contactEmail,
    } : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Consultation created:", { patientId: selectedPatientId, ...consultationData });
        alert("Consulta registrada exitosamente");
    };

    // Función para manejar el cambio de paciente en SearchPatient
    const handlePatientChange = useCallback((value: string) => {
        setSelectedPatientId(value);

        // Actualizar la URL con el nuevo patientId
        if (value) {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set("patientId", value);
            setSearchParams(newParams);
        }
    }, [setSearchParams]);

    // Crear objeto initialPatient para pre-seleccionar en SearchPatient
    const initialPatient = useMemo(() => {
        return patientDetail ? {
            id: patientDetail.id!,
            fullName: `${patientDetail.firstName} ${patientDetail.lastName}`,
            dni: patientDetail.dni || "",
        } : null;
    }, [patientDetail]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Crear Consulta</h2>
                    <p className="text-muted-foreground">Registre una nueva consulta médica</p>
                </div>
            </div>

            {/* Búsqueda de Paciente */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Seleccionar Paciente</CardTitle>
                    <CardDescription>Busque el paciente para iniciar la consulta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SearchPatient
                        isPatientSelected={setIsPatientSelected}
                        setValue={(field, value) => handlePatientChange(value as string)}
                        initialPatient={initialPatient}
                    />
                </CardContent>
            </Card>

            {/* Loading state mientras se carga el paciente */}
            {isLoadingPatientDetail && isPatientSelected && (
                <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="text-lg font-semibold text-foreground">Cargando información del paciente...</p>
                                <p className="text-sm text-muted-foreground">Por favor espere un momento</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Patient Record */}
            {showPatientRecord && mockPatient && !isLoadingPatientDetail && (
                <PatientRecord patient={mockPatient} />
            )}

            {/* Consultation Form */}
            {showPatientRecord && mockPatient && !isLoadingPatientDetail && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">Datos de la Consulta</CardTitle>
                            <CardDescription>Ingrese la información de la consulta médica</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-card-foreground">
                                    Motivo de Consulta *
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder="Ej: Control de presión arterial"
                                    value={consultationData.reason}
                                    onChange={(e) => setConsultationData({ ...consultationData, reason: e.target.value })}
                                    className="bg-background text-foreground"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="symptoms" className="text-card-foreground">
                                    Síntomas
                                </Label>
                                <Textarea
                                    id="symptoms"
                                    placeholder="Describa los síntomas del paciente..."
                                    value={consultationData.symptoms}
                                    onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
                                    className="bg-background text-foreground min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diagnosis" className="text-card-foreground">
                                    Diagnóstico *
                                </Label>
                                <Input
                                    id="diagnosis"
                                    placeholder="Ej: Hipertensión arterial controlada"
                                    value={consultationData.diagnosis}
                                    onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                                    className="bg-background text-foreground"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="treatment" className="text-card-foreground">
                                    Tratamiento
                                </Label>
                                <Textarea
                                    id="treatment"
                                    placeholder="Describa el tratamiento recomendado..."
                                    value={consultationData.treatment}
                                    onChange={(e) => setConsultationData({ ...consultationData, treatment: e.target.value })}
                                    className="bg-background text-foreground min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-card-foreground">
                                    Notas Adicionales
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Observaciones adicionales..."
                                    value={consultationData.notes}
                                    onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                                    className="bg-background text-foreground min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" className="text-card-foreground border-border bg-transparent" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                            Guardar Consulta
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
