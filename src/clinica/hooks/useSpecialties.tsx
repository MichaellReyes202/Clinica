import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSpecialtiesAction, getDoctorBySpecialty, getSpecialtiesAction, getSpecialtiesDetail, getSpecialtiesOption, updateSpecialtiesAction } from "../actions/Specialties.action"
import { useSearchParams } from "react-router"
import type { UseFormSetError } from "react-hook-form"
import type { SpecialtiesFormValues } from "@/admin/Validation/SpecialtiesSchema"
import type { AxiosError } from "axios"
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response"
import type { SpecialtiesCreation, SpecialtiesUpdate } from "@/interfaces/Specialties.response"
import { toast } from "sonner"
import type { DoctorBySpecialtyDto } from "@/interfaces/Appointment.response"
import { handleMutationError } from "@/utils/handleMutationError"

export const useSpecialtiesOption = () => {
  return useQuery({
    queryKey: ["specialtiesOption"],
    queryFn: () => getSpecialtiesOption(),
    staleTime: 1000 * 60 * 60
  })
}

// Obtener el total de las especialidaes medicas para mostrar en formato de tabla 
export const useSpecialties = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ["specialties", { query, limit, page }],
    queryFn: () => getSpecialtiesAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}

// Obtener una especialidad por el id
export const useSpecialtiesDetail = (specialtiesId: number | null) => {
  const query = useQuery<SpecialtiesUpdate, AxiosError>({
    queryKey: ["specialtiesDetail", specialtiesId],
    queryFn: () => getSpecialtiesDetail(specialtiesId!),
    enabled: specialtiesId !== null, // solo se ejecuta si hay un Id valido
    staleTime: 0,  // sin cachear , siempre el mas reciente 
    refetchOnWindowFocus: false
  })
  return {
    ...query,
    specialtie: query.data ?? null, // mas claro para el formulario 
  }
}

export const useSpecialtiesMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<SpecialtiesFormValues>) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (info: SpecialtiesCreation) => createSpecialtiesAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialtiesOption"] });
      queryClient.invalidateQueries({ queryKey: ["examsTypeBySpecialty"] });
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
    mutationFn: (info: SpecialtiesUpdate) => updateSpecialtiesAction(info.id, info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] }); // 
      queryClient.invalidateQueries({ queryKey: ["specialtiesOption"] });
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

// Obtener los examenes por las especialidades

export const useExamsBySpecialty = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ["examsBySpecialty", { query, limit, page }],
    queryFn: () => getSpecialtiesAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}

// obtener todas las especialidades medicas con sus doctores asociados

export const useGetDoctorBySpecialty = () => {
  return useQuery<DoctorBySpecialtyDto[]>({
    queryKey: ["getDoctorBySpecialty"],
    queryFn: () => getDoctorBySpecialty(),
    staleTime: Infinity
  })
}