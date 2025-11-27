import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useSearchParams } from "react-router"
import { getEmployeeAction, getFilteredEmployees } from "../actions/Employee.action";
import type { CreateUserPayload, UserCreation } from "@/interfaces/Users.response";
import { createUserAction } from "../actions/Users.action";
import type { EmployesFilterResponse } from "@/interfaces/Employes.response";
import type { Options } from "@/interfaces/Paginated.response";
import type { AxiosError } from "axios";



// trear una lista de empleados
export const useEmployes = () => {
   const [searchParams] = useSearchParams();

   const query = searchParams.get('query') || undefined;
   const limit = searchParams.get('limit') || 10;
   const page = searchParams.get('page') || 1;

   return useQuery({
      queryKey: ['employees', { query, limit, page }],
      queryFn: () => getEmployeeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
      staleTime: 1000 * 60 * 60, // 1 hora
   })
}

// hook de busqueda de empleados con filtros
export const useEmployeesQuery = (options: Options = {}) => {
   const { limit = 10, offset = 0, query = "" } = options;

   return useQuery<EmployesFilterResponse>({
      queryKey: ["employeesFilter", { limit, offset, query }],
      queryFn: () => getFilteredEmployees({ limit, offset, query }),
      staleTime: 1000 * 60 * 5,
   });
}

export const useUserMutation = () => {
   const queryClient = useQueryClient();

   const createMutation: UseMutationResult<UserCreation, AxiosError, CreateUserPayload> = useMutation({
      mutationFn: (info: CreateUserPayload) => createUserAction(info),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["users"] });
         queryClient.invalidateQueries({ queryKey: ["specialties"] });
      },
      onError: (error) => {
         console.error("Error en la creación:", error);
      },
   });

   return {
      createMutation,
      isPosting: createMutation.isPending
   };
};


