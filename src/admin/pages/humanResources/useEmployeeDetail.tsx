import { getEmployeeDetail } from "@/clinica/actions/Employee.action";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/interfaces/Employes.response";

export const useEmployeeDetail = (employeeId: number | null) => {
  const query = useQuery<Employee, Error>({
    queryKey: ["employeeDetail", employeeId],
    queryFn: () => getEmployeeDetail(employeeId!),
    enabled: employeeId !== null, // solo ejecuta si hay un ID válido
    staleTime: 0,                // sin cachear, siempre fresco
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    employee: query.data ?? null,  // más claro para el formulario
  };
};