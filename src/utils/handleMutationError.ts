import { useAuthStore } from "@/auth/store/auth.store";
import { BackendError, ErrorCodes } from "@/interfaces/Error.response";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export const handleMutationError = <T extends FieldValues>(error: unknown, setError?: UseFormSetError<T>, onErrorMessage?: (message: string) => void) => {
  if (error instanceof BackendError) {
    // 1. Errores de validación de formulario (400)

    if (error.code === ErrorCodes.BadRequest && error.validationErrors && setError) {
      error.validationErrors.forEach((valError) => {
        const fieldName = (valError.propertyName.charAt(0).toLowerCase() + valError.propertyName.slice(1)) as Path<T>;
        setError(fieldName, { type: "server", message: valError.errorMessage });
      });
      return;
    }

    // 2. Errores de negocio con campo específico (Ej: 409 Conflict en "email")
    if (error.field && setError) {
      const fieldName = (error.field.charAt(0).toLowerCase() + error.field.slice(1)) as Path<T>;
      setError(fieldName, { type: "server", message: error.message });
      return;
    }

    // 3. Lógica específica (Ej: Cuenta bloqueada)
    if (error.code === ErrorCodes.TooManyRequests) {
      onErrorMessage!(error.message);
      if (error.metadata?.isLockedOut && onErrorMessage) {
        const lockoutEnd = new Date(error.metadata.lockoutEndUtc);
        useAuthStore.getState().setBlocked(lockoutEnd);
        onErrorMessage(`Cuenta bloqueada. Intenta en ${error.metadata.minutesToWait} minutos.`);
        return;
      }
    }
    if (onErrorMessage) {
      // 4. Errores de negocio generales
      onErrorMessage(error.message);
    } else {
      toast.error(error.message);
    }
  } else {
    // Error global no controlado por Axios (Ej: Error de sintaxis en React)
    const fallbackMsg = error instanceof Error ? error.message : "Error inesperado";
    if (onErrorMessage) onErrorMessage(fallbackMsg);
    else toast.error(fallbackMsg);
  }
};
