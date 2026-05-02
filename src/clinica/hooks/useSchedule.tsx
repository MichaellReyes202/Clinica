import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClinicSchedulesAction,
  updateClinicScheduleAction,
  getEmployeeSchedulesAction,
  upsertEmployeeScheduleAction,
  updateEmployeeAppointmentDurationAction,
} from "@/clinica/actions/schedule.action";
import { toast } from "sonner";

// ── Horario de la clínica ────────────────────────────────────────

export const useClinicSchedules = () =>
  useQuery({
    queryKey: ["clinic-schedules"],
    queryFn: getClinicSchedulesAction,
    staleTime: 1000 * 60 * 10,
  });

export const useUpdateClinicSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { isOpen: boolean; openTime: string; closeTime: string } }) =>
      updateClinicScheduleAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-schedules"] });
      toast.success("Horario actualizado correctamente");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al actualizar el horario");
    },
  });
};

// ── Horario por empleado/doctor ──────────────────────────────────

export const useEmployeeSchedules = (employeeId: number | null) =>
  useQuery({
    queryKey: ["employee-schedules", employeeId],
    queryFn: () => getEmployeeSchedulesAction(employeeId!),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

export const useUpsertEmployeeSchedule = (employeeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { dayOfWeek: number; isAvailable: boolean; startTime: string; endTime: string }) =>
      upsertEmployeeScheduleAction(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-schedules", employeeId] });
      toast.success("Horario del empleado actualizado");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al actualizar el horario");
    },
  });
};

export const useUpdateEmployeeDuration = (employeeId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (minutes: number) => updateEmployeeAppointmentDurationAction(employeeId, minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Duración de cita actualizada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al actualizar la duración");
    },
  });
};
