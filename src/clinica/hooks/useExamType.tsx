

// trae toda la lista de los examenes

import { useSearchParams } from "react-router";
import { createExamTypeAction, examsBySpecialtyAction, getExamTypeAction, getExamTypeDetail, updateExamTypeAction } from "../actions/ExamType.action";
import type { ExamsBySpecialtyListDto, ExamType } from "@/interfaces/ExamType.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import type { PatientFormValue } from "@/admin/Validation/Patient.Schema";
import type { AxiosError } from "axios";
import type { UseFormSetError } from "react-hook-form";

export const useExamType = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery<PaginatedResponseDto<ExamType>>({
    queryKey: ['examsType', { page, limit, query }],
    queryFn: () => getExamTypeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60, // 1 hora
  })
}

export const useExamsBySpecialty = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery<PaginatedResponseDto<ExamsBySpecialtyListDto>>({
    queryKey: ['examsTypeBySpecialty', { page, limit, query }],
    queryFn: () => examsBySpecialtyAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}

// hook para la busqueda del paciente por el id
export const useExamTypeDetail = (examTypeId: string | null) => {
  const query = useQuery<ExamType, Error>({
    queryKey: ["examsTypeDetail"],
    queryFn: () => getExamTypeDetail(examTypeId!),
    enabled: examTypeId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    patient: query.data ?? null,
  };
};


export const usePatientMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<PatientFormValue>) => {
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
        setError(serverError.field as keyof PatientFormValue, {
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
          setError(err.propertyName as keyof PatientFormValue, {
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
    mutationFn: (info: Partial<ExamType>) => createExamTypeAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onSuccessAction?.();
      toast.success("Paciente creado correctamente");
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: (info: Partial<ExamType>) => updateExamTypeAction(info.id!, info),
    //  utilizar la optimistic update
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patientDetail"] });
      queryClient.invalidateQueries({ queryKey: ["patientsFilter"] })
      onSuccessAction?.();
      toast.success("Paciente actualizado correctamente");
    },
    onError: handleMutationError,
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
};
