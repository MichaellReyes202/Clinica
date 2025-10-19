import type { EmployeeCreationDto, EmployeeUpdateDto } from "@/interfaces/Employes.response";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createEmployeeAction, updateEmployeeAction } from "../actions/Employee.action";
import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";
import type { EmployeeFormValues } from "@/admin/Validation/EmployeeSchema";

export const useEmployeeMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<EmployeeFormValues>) => {
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
        setError(serverError.field as keyof EmployeeFormValues, {
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
          setError(err.propertyName as keyof EmployeeFormValues, {
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
      // Aquí se recomienda mostrar un Toast/Notificación global
      return;
    }

    // Manejo de 500 o fallbacks
    console.error(`Error del servidor ${status}:`, data);

  };

  const createMutation = useMutation({
    mutationFn: (info: EmployeeCreationDto) => createEmployeeAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccessAction?.();
      toast.success("Empleado creado correctamente");
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: (info: EmployeeUpdateDto) => updateEmployeeAction(info.id, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccessAction?.();
      toast.success("Empleado actualizado correctamente");
    },
    onError: handleMutationError,
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
};


// if (status === 400) {
//   const validation = data as ValidationResponse;
//   validation.errors?.forEach(err => {
//     const fieldName = err.propertyName as keyof EmployeeFormValues;
//     Solo asignamos si el campo existe en el formulario
//     if (fieldName in ({} as EmployeeFormValues)) {
//       setError?.(fieldName, { type: "validation", message: err.errorMessage });
//     } else {
//       console.warn(
//         `Campo '${err.propertyName}' no encontrado en EmployeeFormValues`
//       );
//     }
//   });
//   return;
// }
// toast.error("Error inesperado al procesar la solicitud");