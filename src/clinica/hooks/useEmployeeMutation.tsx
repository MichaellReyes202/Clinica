
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "@/interfaces/Employes.response";
import { createEmployeeAction, updateEmployeeAction } from "../actions/Employee.action";


export const useEmployeeMutation = (onSuccessAction?: () => void) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Employee>) => createEmployeeAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccessAction?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
      updateEmployeeAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccessAction?.();
    },
  });

  return { createMutation, updateMutation };
};
