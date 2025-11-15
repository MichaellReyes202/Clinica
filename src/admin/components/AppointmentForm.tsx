import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentSchema, type AppointmentFormValues } from "../Validation/AppointmentSchema";
import { SearchPatient } from "../pages/appointments/components/SearchPatient";
import type { DoctorBySpecialtyDto, AppointmentResponseDto, AppointmentCreateDto, AppointmentUpdateDto } from "@/interfaces/Appointment.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import { useAppointmentMutation } from "@/clinica/hooks/useAppointments";

interface AppointmentFormProps {
  mode?: "create" | "edit";
  initialStart?: string;
  initialEvent?: AppointmentResponseDto | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  doctorBySpecialty: DoctorBySpecialtyDto[];
  onEventSaved: () => void;
}

export const AppointmentForm = ({ mode = "create", initialStart = "", initialEvent, setOpen, doctorBySpecialty, onEventSaved, }: AppointmentFormProps) => {
  const [doctors, setDoctors] = useState<OptionDto[]>([]);
  const [IsSelectedPatient, setIsSelectedPatient] = useState<boolean>(() => {
    return mode === "edit" && !!initialEvent?.patientId;
  });

  const defaultValues: AppointmentFormValues = {
    id: initialEvent?.id,
    patientId: initialEvent?.patientId?.toString() || "",
    employeeId: initialEvent?.employeeId?.toString() || "",
    doctorSpecialtyId: initialEvent?.doctorSpecialtyId.toString() || "0",
    startTime: initialEvent ? initialEvent.startTime.slice(0, 16) : initialStart.slice(0, 16) || "",
    duration:
      initialEvent && initialEvent.startTime && initialEvent.endTime ? Math.round((new Date(initialEvent.endTime).getTime() - new Date(initialEvent.startTime).getTime()) / 60000).toString()
        : "30",
    reason: initialEvent?.reason || "",
    statusId: initialEvent?.statusId.toString()
  };

  const { handleSubmit, register, setValue, watch, clearErrors, reset, formState: { errors } } = useForm<AppointmentFormValues>({
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

  const { createMutation, updateMutation, isPosting } = useAppointmentMutation();

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
      console.log(payload)
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
      console.log(payload)
      updateMutation.mutate(payload)
    }
    onEventSaved();
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="space-y-4">
                <SearchPatient isPatientSelected={setIsSelectedPatient} setValue={setValue} initialPatient={mode === "edit" && initialEvent ? { id: initialEvent.patientId, fullName: initialEvent.patientFullName } : null} />
                {errors.patientId && (<p className="text-red-500 text-sm">{errors.patientId.message}</p>)}
              </div>
              {IsSelectedPatient && (
                <div className="space-y-2 pt-4">
                  <Label>Motivo de la consulta</Label>
                  <Textarea
                    {...register("reason")}
                    placeholder="Describa el motivo..."
                    className="min-h-40 resize-none"
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
                  <SelectTrigger className="w-full">
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
                <Select disabled={doctors.length === 0} onValueChange={(v) => setValue("employeeId", v)} value={watch("employeeId")}>
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
                <Input {...register("startTime")} type="datetime-local" className="w-full" />
                {errors.startTime && (<p className="text-red-500 text-sm"> {errors.startTime.message}</p>)}
              </div>
              <div className="space-y-2">
                <Label>Duración (min) *</Label>
                <Select onValueChange={(value) => setValue("duration", value)} value={watch("duration")}>
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
                    <Select onValueChange={(value) => setValue("statusId", value)} value={watch("statusId")}>
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
              <Textarea {...register("reason")} placeholder="Describa el motivo..." className="min-h-20 resize-none" />
              {errors.reason && (
                <p className="text-red-500 text-sm">{errors.reason.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground" disabled={isPosting}>
          {mode === "create" ? "Agendar Cita" : "Actualizar Cita"}
        </Button>
      </div>
    </form>
  );
};

