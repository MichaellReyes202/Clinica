import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointmentAction, getAppointments, getDoctorAvailability, updateAppointmentAction } from "../actions/Appointments.action";
import type { AppointmentCreateDto, AppointmentResponseDto, AppointmentUpdateDto, DoctorAvailabilityDto } from "@/interfaces/Appointment.response";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import { toast } from "sonner";
import type { PatientFormValue } from "@/admin/Validation/Patient.Schema";
import type { AxiosError } from "axios";
import type { UseFormSetError } from "react-hook-form";
import type { AppointmentFormValues } from "@/admin/Validation/AppointmentSchema";


export const useAppointments = () => {
  return useQuery<AppointmentResponseDto[]>({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

export const useDoctorsAvailability = () => {
  return useQuery<DoctorAvailabilityDto[]>({
    queryKey: [""],
    queryFn: () => getDoctorAvailability(),
    staleTime: 1000 * 60 * 5
  })
}

export const useAppointmentMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<AppointmentFormValues>) => {
  const queryClient = useQueryClient();

  const handleMutationError = (error: unknown) => {
    const axiosError = error as AxiosError;
    if (!axiosError?.response) {
      console.error("Error no manejado:", error);
      toast.error("Error desconocido en el servidor");
      return;
    }
    const { status, data } = axiosError.response;

    // ----------------------------------------------------
    // A. Manejo de Errores 409 Conflict (Errores de Negocio con Campo)
    // ----------------------------------------------------

    if (status === 409) {
      const serverError = data as SingularError;
      if (setError && serverError.field) {
        // Inyectamos el error en el campo específico del formulario
        setError(serverError.field as keyof AppointmentFormValues, {
          type: serverError.code,
          message: serverError.description
        });
      } else {
        toast(`Error 409 sin campo: ", ${serverError.description}`)
        console.error("Error 409 sin campo: ", serverError.description);
      }
      return;
    }

    // ----------------------------------------------------
    // B. Manejo de Errores 400 Bad Request (Validación Múltiple)
    // ----------------------------------------------------
    if (status === 400) {
      const validationResponse = data as ValidationResponse;
      if (setError && validationResponse.errors?.length) {
        validationResponse.errors.forEach(err => {
          // Inyectamos el error en cada campo afectado
          setError(err.propertyName as keyof AppointmentFormValues, {
            type: "validation",
            message: err.errorMessage
          });
        });
      } else {
        // Manejar 400 sin lista de errores (ej: si el backend devuelve un 400 singular)
        console.error("Error 400 genérico:", validationResponse.message);
      }
      return;
    }

    // ----------------------------------------------------
    // C. Manejo de Errores Globales (404, 500, etc.)
    // ----------------------------------------------------
    if (status === 404) {
      console.error("Recurso no encontrado (404):", (data as SingularError).description);
      return;
    }

    // Manejo de 500 o fallbacks
    console.error(`Error del servidor ${status}:`, data);

  };

  const createMutation = useMutation({
    mutationFn: (info: AppointmentCreateDto) => createAppointmentAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onSuccessAction?.();
      toast.success("La cita se creo correctamente");
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: (info: AppointmentUpdateDto) => updateAppointmentAction(info.id!, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onSuccessAction?.();
      toast.success("La Cita se actualizo correctamente");
    },
    onError: handleMutationError,
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
};
