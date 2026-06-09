import type { EmployeeCreationDto, EmployeeUpdateDto } from "@/interfaces/Employes.response";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createEmployeeAction, updateEmployeeAction } from "../actions/Employee.action";
import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";
import type { EmployeeFormValues } from "@/admin/Validation/EmployeeSchema";
import { handleMutationError } from "@/utils/handleMutationError";

export const useEmployeeMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<EmployeeFormValues>) => {
  const queryClient = useQueryClient();


  const createMutation = useMutation({
    mutationFn: (info: EmployeeCreationDto) => createEmployeeAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Empleado creado correctamente");
    },
    onError: (error) => handleMutationError(error, setError, function (value: string) {
      toast.message(value, { duration: 3000 });
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (info: EmployeeUpdateDto) => updateEmployeeAction(info.id, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Empleado actualizado correctamente");
    },
    onError: (error) => handleMutationError(error, setError, function (value: string) {
      toast.message(value, { duration: 3000 });
    }),
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
};