import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useSearchParams } from "react-router"
import { getEmployeeAction, getFilteredEmployees } from "../actions/Employee.action";
import { toast } from "sonner";
import type { CreateUserPayload, UserCreation } from "@/interfaces/Users.response";
import { createUserAction } from "../actions/Users.action";
import type { EmployesFilterResponse } from "@/interfaces/Employes.response";
import type { Options } from "@/interfaces/Paginated.response";
import type { AxiosError } from "axios";



export const useEmployes = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ['employees', { query, limit, page }],
    queryFn: () => getEmployeeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useEmployeesQuery = (options: Options = {}) => {
  const { limit = 10, offset = 0, query = "" } = options;

  return useQuery<EmployesFilterResponse>({
    queryKey: ["employees", { limit, offset, query }],
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
      const backendMessage = error.response?.data?.message || "Error inesperado";
      toast.error(backendMessage);
      console.error("Error en la creación:", error);
    },
  });

  return {
    createMutation,
    isPosting: createMutation.isPending
  };
};


