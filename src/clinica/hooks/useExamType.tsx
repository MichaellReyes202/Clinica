

// trae toda la lista de los examenes

import { useSearchParams } from "react-router";
import { createExamTypeAction, examsBySpecialtyAction, getExamTypeAction, getExamTypeDetail, updateExamTypeAction, updateStateExamTypeAction } from "../actions/ExamType.action";
import type { ExamsBySpecialtyListDto, ExamType, ExamTypeCreateDto } from "@/interfaces/ExamType.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SingularError, ValidationResponse } from "@/interfaces/Error.response";
import type { PatientFormValue } from "@/admin/Validation/Patient.Schema";
import type { AxiosError } from "axios";
import type { UseFormSetError } from "react-hook-form";
import type { ExamTypeFormValues } from "@/admin/Validation/ExamTypeSchema";

export const useExamType = () => {
    const [searchParams] = useSearchParams();

    const query = searchParams.get('query') || undefined;
    const limit = searchParams.get('limit') || 10;
    const page = searchParams.get('page') || 1;

    return useQuery<PaginatedResponseDto<ExamType>>({
        queryKey: ['examsType', { page, limit, query }],
        queryFn: () => getExamTypeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
        staleTime: 1000 * 60 * 60, // 1 hora
    })
}

export const useExamsBySpecialty = () => {
    const [searchParams] = useSearchParams();

    const query = searchParams.get('query') || undefined;
    const limit = searchParams.get('limit') || 10;
    const page = searchParams.get('page') || 1;

    return useQuery<PaginatedResponseDto<ExamsBySpecialtyListDto>>({
        queryKey: ['examsTypeBySpecialty', { page, limit, query }],
        queryFn: () => examsBySpecialtyAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
        staleTime: 1000 * 60 * 60
    })
}

// hook para la busqueda del paciente por el id
export const useExamTypeDetail = (examTypeId: string | null) => {
    const query = useQuery<ExamType, Error>({
        queryKey: ["examsTypeDetail"],
        queryFn: () => getExamTypeDetail(examTypeId!),
        enabled: examTypeId !== null,
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
    return {
        ...query,
        patient: query.data ?? null,
    };
};


export const useExamTypeMutation = (onSuccessAction?: () => void, setError?: UseFormSetError<ExamTypeFormValues>) => {
    const queryClient = useQueryClient();

    const handleMutationError = (error: unknown) => {
        const axiosError = error as AxiosError;
        if (!axiosError?.response) {
            console.error("Error no manejado:", error);
            toast.error("Error desconocido en el servidor");
            return;
        }
        const { status, data } = axiosError.response;

        if (status === 409) {
            const serverError = data as SingularError;
            if (setError && serverError.field) {
                setError(serverError.field as keyof ExamTypeFormValues, {
                    type: serverError.code,
                    message: serverError.description
                });
            } else {
                toast(`Error 409 sin campo: ", ${serverError.description}`)
                console.error("Error 409 sin campo: ", serverError.description);
            }
            return;
        }
        if (status === 400) {
            const validationResponse = data as ValidationResponse;
            if (setError && validationResponse.errors?.length) {
                validationResponse.errors.forEach(err => {
                    // Mapear nombres de campo de PascalCase (servidor) a camelCase (formulario)
                    const fieldMapping: Record<string, keyof ExamTypeFormValues> = {
                        'Name': 'name',
                        'Description': 'description',
                        'DeliveryTime': 'deliveryTime',
                        'PricePaid': 'pricePaid',
                        'SpecialtyId': 'specialtyId',
                    };

                    const fieldName = fieldMapping[err.propertyName] || err.propertyName.toLowerCase() as keyof ExamTypeFormValues;

                    setError(fieldName, {
                        type: "validation",
                        message: err.errorMessage
                    });
                });
            } else {
                console.error("Error 400 genérico:", validationResponse.message);
            }
            return;
        }
        if (status === 404) {
            console.error("Recurso no encontrado (404):", (data as SingularError).description);
            return;
        }

        // Manejo de 500 o fallbacks
        console.error(`Error del servidor ${status}:`, data);

    };

    const createMutation = useMutation({
        mutationFn: (info: ExamTypeCreateDto) => createExamTypeAction(info),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examsType"] });
            queryClient.invalidateQueries({ queryKey: ["examsTypeBySpecialty"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
            onSuccessAction?.();
            toast.success("Examen creado correctamente", {
                position: "bottom-right"
            });
        },
        onError: handleMutationError,
    });

    const updateMutation = useMutation({
        mutationFn: (info: Partial<ExamType>) => updateExamTypeAction(info.id!, info),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examsType"] });
            queryClient.invalidateQueries({ queryKey: ["examsTypeBySpecialty"] });
            queryClient.invalidateQueries({ queryKey: ["examsTypeDetail"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
            onSuccessAction?.();
            toast.success("Examen actualizado correctamente", {
                position: "bottom-right"
            });
        },
        onError: handleMutationError,
    });

    const updateStateMutation = useMutation({
        mutationFn: (id: number) => updateStateExamTypeAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examsType"] });
            queryClient.invalidateQueries({ queryKey: ["examsTypeBySpecialty"] });
            queryClient.invalidateQueries({ queryKey: ["examsTypeDetail"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
            toast.success("Estado del examen actualizado correctamente", {
                position: "bottom-right"
            });
        },
        onError: handleMutationError,
    });

    return {
        createMutation,
        updateMutation,
        updateStateMutation,
        isPosting: createMutation.isPending || updateMutation.isPending || updateStateMutation.isPending,
    };
};
