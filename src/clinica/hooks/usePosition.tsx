import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createPositionAction, getPositionDetail, getPositionOption, getPositionsAction, updatePositionAction } from "../actions/Position.action"
import { useSearchParams } from "react-router"
import type { PositionCreation, PositionUpdate } from "@/interfaces/Positions.response"
import type { AxiosError } from "axios"
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response"
import type { SpecialtiesFormValues } from "@/admin/Validation/SpecialtiesSchema"
import { toast } from "sonner"
import type { UseFormSetError } from "react-hook-form"
import type { PositionFormValues } from "@/admin/Validation/PositionSchema"



// Obtener todas posiciones (para mostrar como una lista de opciones )
export const usePositionOption = () => {
  return useQuery({
    queryKey: ["positionOption"],
    queryFn: () => getPositionOption(),
    staleTime: 1000 * 60 * 60
  })
}

// obtener todos los cargos y mostrar en la tabla
export const usePositions = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ["positions", { query, limit, page }],
    queryFn: () => getPositionsAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}

// Obtener un cargo por el Id
export const usePositionDetail = (positionId: number | null) => {
  const query = useQuery<PositionUpdate, AxiosError>({
    queryKey: ["positionDetail", positionId],
    queryFn: () => getPositionDetail(positionId!),
    enabled: positionId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false
  })
  return {
    ...query,
    position: query.data ?? null, // mas claro para el formulario 
  }
}

export const usePositionMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<PositionFormValues>) => {
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
        setError(serverError.field as keyof SpecialtiesFormValues, {
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
        let hasFieldError = false;
        let generalErrors: string[] = [];

        validationResponse.errors.forEach(err => {
          const fieldName = err.propertyName as keyof SpecialtiesFormValues;

          // Verificamos si el campo pertenece al formulario
          if (fieldName in ({} as SpecialtiesFormValues)) {
            hasFieldError = true;
            setError(fieldName, {
              type: "validation",
              message: err.errorMessage
            });
          } else {
            generalErrors.push(err.errorMessage);
          }
        });

        // Si hay errores generales, los mostramos como toast
        if (generalErrors.length > 0) {
          toast.error(generalErrors.join("\n"), {
            position: "top-right",
            duration: 6000,
          });
        }

        // Si no hay errores asignables, mostramos un mensaje genérico
        if (!hasFieldError && generalErrors.length === 0) {
          toast.error(`Error 400: ${validationResponse.message}`, {
            position: "top-right",
          });
        }
      } else {
        // Manejar 400 sin lista de errores (caso inesperado)
        toast.error(`Error 400: ${validationResponse.message}`, {
          position: "top-right",
        });
      }

      return;
    }

    // ----------------------------------------------------
    // C. Manejo de Errores Globales (404, 500, etc.)
    // ----------------------------------------------------
    if (status === 404) {
      console.error("Recurso no encontrado (404):", (data as SingularError).description);
      toast.error((data as SingularError).description)
      return;
    }

    // Manejo de 500 o fallbacks
    console.error(`Error del servidor ${status}:`, data);

  };

  const createMutation = useMutation({
    mutationFn: (info: PositionCreation) => createPositionAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["positionOption"] });
      onSuccessAction?.();
      toast.success("Especialidad creada correctamente", {
        position: "bottom-right"
      });
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: (info: PositionUpdate) => updatePositionAction(info.id, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] }); // 
      queryClient.invalidateQueries({ queryKey: ["positionOption"] });
      onSuccessAction?.();
      toast.success("Especialidd actualizada correctamente");
    },
    onError: handleMutationError,
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
}