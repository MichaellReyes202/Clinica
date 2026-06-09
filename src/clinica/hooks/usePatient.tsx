import { useSearchParams } from "react-router";
import { createPatientAction, getFilteredPatient, getPatientAction, getPatientDetail, updatePatientAction } from "../actions/Patient.action";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import type { Patient, PatientFilterResponse, PatientListDto } from "@/interfaces/Patient.response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import type { UseFormSetError } from "node_modules/react-hook-form/dist/types/form";
import type { PatientFormValue } from "@/admin/Validation/Patient.Schema";
import { handleMutationError } from "@/utils/handleMutationError";




// trear una lista de paciente 
export const usePatients = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery<PaginatedResponseDto<PatientListDto>>({
    queryKey: ['patients', { page, limit, query }],
    queryFn: () => getPatientAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60, // 1 hora
  })
}

// hook de busqueda de empleados con filtros
export const usePatientQuery = (options: Options = {}) => {
  const { limit = 10, offset = 0, query = "" } = options;

  return useQuery<PaginatedResponseDto<PatientFilterResponse>>({
    queryKey: ["patientsFilter", { limit, offset, query }],
    queryFn: () => getFilteredPatient({ limit, offset, query }),
    staleTime: 1000 * 60 * 60,
  });
}

// hook para la busqueda del paciente por el id
export const usePatientDetail = (patientId: string | null) => {
  const query = useQuery<Patient, Error>({
    queryKey: ["patientDetail", patientId],
    queryFn: () => getPatientDetail(patientId!),
    enabled: patientId !== null, // solo ejecuta si hay un ID válido
    staleTime: 0,                // sin cachear, siempre fresco
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    patient: query.data ?? null,  // más claro para el formulario
  };
};

export const usePatientMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<PatientFormValue>) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (info: Patient) => createPatientAction(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Paciente creado correctamente");
    },
    onError: (error) => handleMutationError(error, setError, function (value: string) {
      toast.message(value, { duration: 60000 });
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (info: Patient) => updatePatientAction(info.id!, info),
    //  utilizar la optimistic update
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patientDetail"] });
      queryClient.invalidateQueries({ queryKey: ["patientsFilter"] })
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      onSuccessAction?.();
      toast.success("Paciente actualizado correctamente");
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
};


