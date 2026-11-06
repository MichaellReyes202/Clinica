import { getEmployeeDetail, getMyEmployeeDetail } from "@/clinica/actions/Employee.action";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/interfaces/Employes.response";

export const useEmployeeDetail = (employeeId: number | null, isCurrentUser = false) => {
  const query = useQuery<Employee, Error>({
    queryKey: ["employeeDetail", employeeId],
    queryFn: () => isCurrentUser ? getMyEmployeeDetail() : getEmployeeDetail(employeeId!),
    enabled: employeeId !== null, // solo ejecuta si hay un ID válido
    staleTime: 0,                // sin cachear, siempre fresco
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    employee: query.data ?? null,  // más claro para el formulario
  };
};
