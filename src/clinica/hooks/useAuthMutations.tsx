import { useMutation } from "@tanstack/react-query";
import { loginAction, resetPasswordAction } from "@/auth/actions/login.action";
import type { UseFormSetError } from "react-hook-form";
import type { LoginFormValues } from "@/auth/pages/LoginPage";
import { useAuthStore } from "@/auth/store/auth.store";
import { handleMutationError } from "@/utils/handleMutationError";

export const useResetPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: resetPasswordAction,
  });

  return mutation;
};


export const useAuthMutation = (
  onSuccessAction?: (data: any) => void, setError?: UseFormSetError<LoginFormValues>, onErrorMessage?: (value: string) => void) => {

  const { setCredentials } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => loginAction(data.email, data.password),
    onSuccess: (data) => {
      setCredentials(data.user, data.token);
      if (onSuccessAction) {
        onSuccessAction(data);
      }
    },
    onError: (error) => {
      handleMutationError(error, setError, onErrorMessage);
    }

  });
  return loginMutation;
};



















// onError: (error) => {
//   if (error instanceof BackendError) {
//     if (error.code === ErrorCodes.BadRequest && error.validationErrors) {

//       error.validationErrors.forEach((valError) => {
//         const fieldName = (valError.propertyName.charAt(0).toLowerCase() + valError.propertyName.slice(1)) as keyof LoginFormValues;
//         if (setError) {
//           setError(fieldName, { type: "server", message: valError.errorMessage });
//         }
//       });
//       return;
//     }
//     if (error.metadata?.isLockedOut) {
//       if (onErrorMessage) {
//         const message: string = `Cuenta bloqueada. Intenta en ${error.metadata.minutesToWait} minutos.`
//         onErrorMessage(message);
//       }
//       return;
//     }
//     // Errores Generales (401, 404 etc )
//     toast.error(error.message);
//   } else {
//     // error global
//     if (onErrorMessage) {
//       onErrorMessage((error as Error).message)
//     }
//   }
// },