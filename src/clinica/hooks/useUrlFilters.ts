import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";

export interface FilterValues {
  search?: string;
  specialty?: string;
  doctor?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extraer valores de filtros desde URL
  const filters = useMemo<FilterValues>(
    () => ({
      search: searchParams.get("search") || undefined,
      specialty: searchParams.get("specialty") || undefined,
      doctor: searchParams.get("doctor") || undefined,
      status: searchParams.get("status") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    }),
    [searchParams]
  );

  // Actualizar un filtro individual
  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const newParams = new URLSearchParams(searchParams);

      if (!value || value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }

      // Resetear página a 1 cuando se cambian filtros
      if (key !== "page") {
        newParams.delete("page");
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Actualizar múltiples filtros a la vez
  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all" || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      // Resetear página a 1 cuando se cambian filtros
      newParams.delete("page");

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const newParams = new URLSearchParams();

    // Preservar parámetros que no son filtros (como page si está en 1)
    const page = searchParams.get("page");
    if (page && page !== "1") {
      newParams.set("page", page);
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || (filters.specialty && filters.specialty !== "all") || (filters.doctor && filters.doctor !== "all") || (filters.status && filters.status !== "all") || filters.dateFrom || filters.dateTo);
  }, [filters]);

  // Contar filtros activos
  const activeFilterCount = useMemo(() => {
    return [filters.search, filters.specialty && filters.specialty !== "all", filters.doctor && filters.doctor !== "all", filters.status && filters.status !== "all", filters.dateFrom, filters.dateTo].filter(Boolean).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};
