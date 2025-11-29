import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointmentAction, getAppointmentDetailAction, getAppointments, getDoctorAvailability, getTodayAppointments, updateAppointmentAction, updateAppointmentStatusAction, deleteAppointmentAction } from "../actions/Appointments.action";
import type { AppointmentCreateDto, AppointmentDetailDto, AppointmentResponseDto, AppointmentUpdateDto, DoctorAvailabilityDto, TodayAppointmentDto, UpdateStatusAppointmenDto } from "@/interfaces/Appointment.response";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { UseFormSetError } from "react-hook-form";
import type { AppointmentFormValues } from "@/admin/Validation/AppointmentSchema";
import { useSearchParams } from "react-router";

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
                // Convertir a camelCase para que coincida con el formulario (StartTime -> startTime)
                const fieldName = serverError.field.charAt(0).toLowerCase() + serverError.field.slice(1);
                setError(fieldName as keyof AppointmentFormValues, {
                    type: serverError.code,
                    message: serverError.description
                });
            } else {
                toast.error(`Error 409: ${serverError.description}`)
                console.error("Error 409 sin campo: ", serverError.description);
            }
            return;
        }

        // ----------------------------------------------------
        // B. Manejo de Errores 400 Bad Request (Validación Múltiple o Error de Negocio)
        // ----------------------------------------------------
        if (status === 400) {
            // Intentar primero como ValidationResponse
            const validationResponse = data as ValidationResponse;

            // Si tiene un array de errores, es una validación múltiple
            if (validationResponse.errors && Array.isArray(validationResponse.errors) && validationResponse.errors.length > 0) {
                if (setError) {
                    validationResponse.errors.forEach(err => {
                        // Convertir a camelCase para que coincida con el formulario
                        const fieldName = err.propertyName.charAt(0).toLowerCase() + err.propertyName.slice(1);
                        setError(fieldName as keyof AppointmentFormValues, {
                            type: "validation",
                            message: err.errorMessage
                        });
                    });
                }
            } else {
                // Si no tiene array de errores, puede ser un SingularError (error de negocio)
                const businessError = data as SingularError;

                if (setError && businessError.field) {
                    // Convertir a camelCase para que coincida con el formulario (StartTime -> startTime)
                    const fieldName = businessError.field.charAt(0).toLowerCase() + businessError.field.slice(1);
                    setError(fieldName as keyof AppointmentFormValues, {
                        type: businessError.code || "business",
                        message: businessError.description || "Error en el campo"
                    });
                } else if (businessError.description) {
                    // Mostrar toast si no hay campo específico pero hay descripción
                    toast.error(businessError.description);
                } else {
                    // Fallback: mostrar el mensaje genérico
                    toast.error(validationResponse.message || "Error de validación");
                }
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
            queryClient.invalidateQueries({ queryKey: ["doctors-availability"] });
            queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
            onSuccessAction?.();
            toast.success("La cita se creo correctamente");
        },
        onError: handleMutationError,
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
        onError: handleMutationError,
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

    const handleMutationError = (error: unknown) => {
        const axiosError = error as AxiosError;
        if (!axiosError?.response) {
            console.error("Error no manejado:", error);
            toast.error("Error desconocido en el servidor");
            return;
        }
        const { status, data } = axiosError.response;

        if (status === 409) {
            const serverError = data as SingularError;
            toast.error(`Error 409: ${serverError.description}`)
            console.error("Error 409 sin campo: ", serverError.description);
        }

        if (status === 400) {
            const validationResponse = data as ValidationResponse;
            toast.error(`Error 400: ${validationResponse.message}`)
            console.error("Error 400 genérico:", validationResponse.message);
            return;
        }
        if (status === 404) {
            toast.error(`Error 404: Recurso no encontrado`)
            console.error("Recurso no encontrado (404):", (data as SingularError).description);
            return;
        }
        console.error(`Error del servidor ${status}:`, data);

    };

    const mutation = useMutation({
        mutationFn: (info: UpdateStatusAppointmenDto) => updateAppointmentStatusAction(info),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
            toast.success("El estado de la cita se actualizó correctamente");
        },
        onError: handleMutationError,
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
