import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointmentAction, getAppointmentDetailAction, getAppointments, getDoctorAvailability, getTodayAppointments, updateAppointmentAction, updateAppointmentStatusAction, deleteAppointmentAction } from "../actions/Appointments.action";
import type { AppointmentCreateDto, AppointmentDetailDto, AppointmentResponseDto, AppointmentUpdateDto, DoctorAvailabilityDto, TodayAppointmentDto, UpdateStatusAppointmenDto } from "@/interfaces/Appointment.response";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { UseFormSetError } from "react-hook-form";
import type { AppointmentFormValues } from "@/admin/Validation/AppointmentSchema";
import { useSearchParams } from "react-router";
import { handleMutationError } from "@/utils/handleMutationError";

export const useAppointments = () => {
  const [searchParams] = useSearchParams();

  // Extraer y parsear parámetros
  const search = searchParams.get('search') || undefined;
  const specialtyParam = searchParams.get('specialty');
  const doctorParam = searchParams.get('doctor');
  const statusParam = searchParams.get('status');
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  // Parsear valores numéricos
  const specialty = specialtyParam && specialtyParam !== 'all' ? parseInt(specialtyParam) : undefined;
  const doctor = doctorParam && doctorParam !== 'all' ? parseInt(doctorParam) : undefined;
  const status = statusParam && statusParam !== 'all' ? parseInt(statusParam) : undefined;

  return useQuery<AppointmentResponseDto[]>({
    queryKey: ["appointments", { search, specialty, doctor, status, dateFrom, dateTo }],
    queryFn: () => getAppointments({ search, specialty, doctor, status, dateFrom, dateTo }),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

export const useTodayAppointments = (date?: Date) => {
  return useQuery<TodayAppointmentDto[]>({
    queryKey: ['today-appointments', date],
    queryFn: () => getTodayAppointments(date),
    refetchInterval: 5 * 60 * 1000, // refrescar cada 5 minutos
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
};

export const useDoctorsAvailability = (specialtyId: string | null) => {
  return useQuery<DoctorAvailabilityDto[]>({
    queryKey: ['doctors-availability', specialtyId],
    queryFn: () => getDoctorAvailability(specialtyId),
    refetchInterval: 5 * 60 * 1000, // refrescar cada 5 minutos
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
};

export const useAppointmentMutation = (
  onSuccessAction?: () => void,
  setError?: UseFormSetError<AppointmentFormValues>,
  onErrorMessage?: (value: string) => void
) => {
  const queryClient = useQueryClient();


  const createMutation = useMutation({
    mutationFn: (info: AppointmentCreateDto) => createAppointmentAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors-availability"] });
      queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("La cita se creo correctamente");
    },
    onError: (error) => handleMutationError(error, setError, onErrorMessage),
  });

  const updateMutation = useMutation({
    mutationFn: (info: AppointmentUpdateDto) => updateAppointmentAction(info.id!, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors-availability"] });
      queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("La Cita se actualizo correctamente");
    },
    onError: (error) => handleMutationError(error, setError, onErrorMessage),
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
};

// hook para actualizar el estado de la cita
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();



  const mutation = useMutation({
    mutationFn: (info: UpdateStatusAppointmenDto) => updateAppointmentStatusAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      toast.success("El estado de la cita se actualizó correctamente");
    },
    onError: (error) => handleMutationError(error, (value: string) => {
      toast.message(value, { duration: 6000 });
    }),
  });

  return {
    mutation,
    isPosting: mutation.isPending,
  };
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteAppointmentAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      toast.success("Cita eliminada correctamente");
    },
    onError: (error) => {
      console.error("Error eliminando cita:", error);
      toast.error("Error al eliminar la cita");
    }
  });

  return {
    mutation,
    isDeleting: mutation.isPending
  };
};


// Hook para obtener el detalle de la cita por el id 

export const useActiveConsultationData = (id: string | undefined) => {
  return useQuery<AppointmentDetailDto>({
    queryKey: ["appointment-detail", id],
    queryFn: () => getAppointmentDetailAction(id!),
    enabled: !!id,
    staleTime: 0,                // sin cachear, siempre fresco
    refetchOnWindowFocus: false,
  });
};
