import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createPositionAction, getPositionDetail, getPositionOption, getPositionsAction, updatePositionAction } from "../actions/Position.action"
import { useSearchParams } from "react-router"
import type { PositionCreation, PositionUpdate } from "@/interfaces/Positions.response"
import type { AxiosError } from "axios"
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response"
import type { SpecialtiesFormValues } from "@/admin/Validation/SpecialtiesSchema"
import { toast } from "sonner"
import type { UseFormSetError } from "react-hook-form"
import type { PositionFormValues } from "@/admin/Validation/PositionSchema"
import type { OptionDto } from "@/interfaces/OptionDto.response"
import { handleMutationError } from "@/utils/handleMutationError"



// Obtener todas posiciones (para mostrar como una lista de opciones )
export const usePositionOption = () => {
  return useQuery<OptionDto[]>({
    queryKey: ["positionOption"],
    queryFn: () => getPositionOption(),
    staleTime: 1000 * 60 * 60
  })
}

// obtener todos los cargos y mostrar en la tabla
export const usePositions = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ["positions", { query, limit, page }],
    queryFn: () => getPositionsAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}

// Obtener un cargo por el Id
export const usePositionDetail = (positionId: number | null) => {
  const query = useQuery<PositionUpdate, AxiosError>({
    queryKey: ["positionDetail", positionId],
    queryFn: () => getPositionDetail(positionId!),
    enabled: positionId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false
  })
  return {
    ...query,
    position: query.data ?? null, // mas claro para el formulario 
  }
}

export const usePositionMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<PositionFormValues>) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (info: PositionCreation) => createPositionAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["positionOption"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Especialidad creada correctamente", {
        position: "bottom-right"
      });
    },
    onError: (error) => handleMutationError(error, setError, function (value: string) {
      toast.message(value, { duration: 6000 });
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (info: PositionUpdate) => updatePositionAction(info.id, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] }); // 
      queryClient.invalidateQueries({ queryKey: ["positionOption"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Especialidd actualizada correctamente");
    },
    onError: (error) => handleMutationError(error, setError, function (value: string) {
      toast.message(value, { duration: 6000 });
    }),
  });

  return {
    createMutation,
    updateMutation,
    isPosting: createMutation.isPending || updateMutation.isPending,
  };
}