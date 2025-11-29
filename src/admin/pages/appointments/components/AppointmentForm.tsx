import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentSchema, type AppointmentFormValues } from "../../../Validation/AppointmentSchema";
import { SearchPatient } from "./SearchPatient";
import type { DoctorBySpecialtyDto, AppointmentResponseDto, AppointmentCreateDto, AppointmentUpdateDto } from "@/interfaces/Appointment.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import { useAppointmentMutation } from "@/clinica/hooks/useAppointments";

const formatDateForInput = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
};

interface AppointmentFormProps {
    mode?: "create" | "edit";
    initialStart?: string;
    initialEvent?: AppointmentResponseDto | null;
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPosting: React.Dispatch<React.SetStateAction<boolean>>;
    doctorBySpecialty: DoctorBySpecialtyDto[];
    onEventSaved: () => void;
}

// funcion para el calculo de la duracion de la cita
const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / 60000);
};

export const AppointmentForm = ({ mode = "create", initialStart = "", initialEvent, onClose, setIsPosting, doctorBySpecialty, onEventSaved, }: AppointmentFormProps) => {
    const [doctors, setDoctors] = useState<OptionDto[]>([]);
    const [IsSelectedPatient, setIsSelectedPatient] = useState<boolean>(() => {
        return mode === "edit" && !!initialEvent?.patientId;
    });

    const defaultValues: AppointmentFormValues = {
        id: initialEvent?.id,
        patientId: initialEvent?.patientId?.toString() || "",
        employeeId: initialEvent?.employeeId?.toString() || "",
        doctorSpecialtyId: initialEvent?.doctorSpecialtyId.toString() || "0",
        startTime: initialEvent ? formatDateForInput(initialEvent.startTime) : initialStart.slice(0, 16) || "",
        duration:
            initialEvent && initialEvent.startTime && initialEvent.endTime ? calculateDuration(initialEvent.startTime, initialEvent.endTime).toString()
                : "30",
        reason: initialEvent?.reason || "",
        statusId: initialEvent?.statusId.toString()
    };

    const { handleSubmit, register, setValue, watch, clearErrors, formState: { errors }, setError } = useForm<AppointmentFormValues>({
        resolver: zodResolver(AppointmentSchema),
        defaultValues,
    });

    const handleSetDoctors = (specialtyId: string): void => {
        const specialty = doctorBySpecialty.find((s) => s.id.toString() === specialtyId);
        setDoctors(specialty?.doctors || []);
    };

    useEffect(() => {
        if (mode === "edit" && initialEvent && doctorBySpecialty.length > 0) {
            const specialtyId = initialEvent.doctorSpecialtyId.toString();
            handleSetDoctors(specialtyId);
            setValue("employeeId", initialEvent.employeeId.toString());
        }
    }, [mode, initialEvent, doctorBySpecialty, setValue]);

    const onSuccessCallback = () => {
        onEventSaved();
        setIsPosting(false);
        onClose(false);
    };

    const { createMutation, updateMutation, isPosting } = useAppointmentMutation(onSuccessCallback, setError);

    // Verificar si la cita es no editable (En curso o Completada)
    const isNonEditable = !!(mode === "edit" && initialEvent && (initialEvent.statusId === 3 || initialEvent.statusId === 4));
    const statusLabel = initialEvent?.statusId === 3 ? "En Curso" : initialEvent?.statusId === 4 ? "Completada" : "";

    const onSubmit = (data: AppointmentFormValues): void => {
        clearErrors();
        if (mode == "create") {
            const payload: AppointmentCreateDto = {
                patientId: parseInt(data.patientId),
                employeeId: parseInt(data.employeeId),
                startTime: data.startTime,
                duration: parseInt(data.duration),
                reason: data.reason
            }
            createMutation.mutate(payload);
        }
        if (mode == "edit") {
            const payload: AppointmentUpdateDto = {
                id: data.id!,
                employeeId: parseInt(data.employeeId),
                patientId: parseInt(data.patientId),
                startTime: data.startTime,
                duration: parseInt(data.duration),
                statusId: parseInt(data.statusId!),
                reason: data.reason
            }
            updateMutation.mutate(payload)
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Mensaje de alerta para citas no editables */}
            {isNonEditable && (

                <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-100 dark:border-amber-500/30">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="ml-2">
                        <strong>Cita {statusLabel}:</strong> Esta cita no puede ser editada porque ya está en estado "{statusLabel}".
                        Los campos están deshabilitados para visualización únicamente.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="bg-card border-border">
                <CardContent className="space-y-4 pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="space-y-4">
                                <SearchPatient
                                    isPatientSelected={setIsSelectedPatient}
                                    setValue={setValue}
                                    initialPatient={mode === "edit" && initialEvent ? { id: initialEvent.patientId, fullName: initialEvent.patientFullName } : null}
                                    disabled={isNonEditable}
                                />
                                {errors.patientId && (<p className="text-red-500 text-sm">{errors.patientId.message}</p>)}
                            </div>
                            {IsSelectedPatient && (
                                <div className="space-y-2 pt-4">
                                    <Label>Motivo de la consulta</Label>
                                    <Textarea
                                        {...register("reason")}
                                        placeholder="Describa el motivo..."
                                        className="min-h-40 resize-none"
                                        disabled={isNonEditable}
                                    />
                                    {errors.reason && (
                                        <p className="text-red-500 text-sm">{errors.reason.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={mode == "edit" ? "space-y-2" : "space-y-5"}>
                            <div className="space-y-2">
                                <Label>Especialidad *</Label>
                                <Select value={watch("doctorSpecialtyId")} onValueChange={(value) => {
                                    handleSetDoctors(value);
                                    setValue("doctorSpecialtyId", value)
                                    setValue("employeeId", "");
                                }}
                                >
                                    <SelectTrigger className="w-full" disabled={isNonEditable}>
                                        <SelectValue placeholder="Seleccionar especialidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctorBySpecialty.map((sp) => (
                                            <SelectItem key={sp.id} value={sp.id.toString()}>
                                                {sp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Doctor *</Label>
                                <Select disabled={doctors.length === 0 || isNonEditable} onValueChange={(v) => setValue("employeeId", v)} value={watch("employeeId")}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((dc) => (
                                            <SelectItem key={dc.id} value={dc.id.toString()}>
                                                {dc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.employeeId && (<p className="text-red-500 text-sm"> {errors.employeeId.message}</p>)}
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha y Hora *</Label>

                                <Input
                                    type="datetime-local"
                                    {...register("startTime")}
                                    className="w-full"
                                    disabled={isNonEditable}
                                />
                                {errors.startTime && (<p className="text-red-500 text-sm"> {errors.startTime.message}</p>)}
                            </div>
                            <div className="space-y-2">
                                <Label>Duración (min) *</Label>
                                <Select onValueChange={(value) => setValue("duration", value)} value={watch("duration")} disabled={isNonEditable}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione duración" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[15, 30, 45, 60, 90, 120].map((m) => (
                                            <SelectItem key={m} value={m.toString()}>
                                                {m} min
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.duration && (<p className="text-red-500 text-sm">{errors.duration.message}</p>)}
                            </div>
                            {
                                mode == "edit" && (
                                    <div className="space-y-2">
                                        <Label>Estado de la cita</Label>
                                        <Select onValueChange={(value) => setValue("statusId", value)} value={watch("statusId")} disabled={isNonEditable}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione el estado de la cita" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Programada</SelectItem>
                                                <SelectItem value="2">Confirmada</SelectItem>
                                                <SelectItem value="3">En curso</SelectItem>
                                                <SelectItem value="4">Completada</SelectItem>
                                                <SelectItem value="5">Cancelada</SelectItem>
                                                <SelectItem value="6">Vencida</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    {/* Motivo */}
                    {!IsSelectedPatient && (
                        <div className="space-y-2">
                            <Label>Motivo de la consulta</Label>
                            <Textarea {...register("reason")} placeholder="Describa el motivo..." className="min-h-20 resize-none" disabled={isNonEditable} />
                            {errors.reason && (
                                <p className="text-red-500 text-sm">{errors.reason.message}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onClose(false)}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground" disabled={isPosting || isNonEditable}>
                    {isPosting ? "Guardando..." : mode === "create" ? "Agendar Cita" : "Actualizar Cita"}
                </Button>
            </div>
        </form>
    );
};

