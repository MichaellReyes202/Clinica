import type { EmployeeListDto, EmployesResponse } from "@/interfaces/Employes.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import { getEmployeeAction } from "../actions/Employee.action";
import { getPositionOption } from "../actions/Position.action";
import { getSpecialtiesOption } from "../actions/Specialties.action";
import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

interface HrData {
  employees: EmployesResponse;
  positions: OptionDto[];
  specialties: OptionDto[];
}

interface HrQueryResults {
  data: HrData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export const useHrData = (): HrQueryResults => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  const results = useQueries({
    queries: [
      { queryKey: ['employees'], queryFn: () => getEmployeeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }) },
      { queryKey: ['positions'], queryFn: () => getPositionOption() },
      { queryKey: ['specialties'], queryFn: () => getSpecialtiesOption() },
    ],
  });

  // Desestructurar los resultados en el mismo orden que fueron definidos
  const [employeesQuery, positionsQuery, specialtiesQuery] = results;

  // Determinar el estado general de carga y error
  const isLoading = employeesQuery.isLoading || positionsQuery.isLoading || specialtiesQuery.isLoading;
  const isError = employeesQuery.isError || positionsQuery.isError || specialtiesQuery.isError;
  const error = employeesQuery.error || positionsQuery.error || specialtiesQuery.error;

  // Combinar los datos si todas las queries fueron exitosas
  const data: HrData | undefined = employeesQuery.data && positionsQuery.data && specialtiesQuery.data
    ? {
      employees: employeesQuery.data,
      positions: positionsQuery.data,
      specialties: specialtiesQuery.data,
    }
    : undefined;

  return { data, isLoading, isError, error };
};