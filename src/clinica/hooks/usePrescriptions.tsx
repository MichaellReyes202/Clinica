import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchMedicationsAction } from "../actions/Medication.action";
import { createPrescriptionAction, getPrescriptionByConsultationIdAction, getPrescriptionsByPatientIdAction } from "../actions/Prescription.action";
import { toast } from "sonner";

export const usePrescriptions = () => {
    const queryClient = useQueryClient();

    // Mutation to create prescription
    const createPrescriptionMutation = useMutation({
        mutationFn: createPrescriptionAction,
        onSuccess: () => {
            toast.success("Receta guardada correctamente");
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
        },
        onError: (error) => {
            console.error(error);
            toast.error("Error al guardar la receta");
        }
    });

    return {
        createPrescription: createPrescriptionMutation.mutateAsync,
        isCreating: createPrescriptionMutation.isPending
    };
};

export const useMedicationSearch = (query: string) => {
    return useQuery({
        queryKey: ["medications", query],
        queryFn: () => searchMedicationsAction(query),
        enabled: query.length > 2, // Only search if query has more than 2 chars
        staleTime: 1000 * 60 * 5 // Cache for 5 mins
    });
};

export const useConsultationPrescription = (consultationId: number) => {
    return useQuery({
        queryKey: ["prescription", consultationId],
        queryFn: () => getPrescriptionByConsultationIdAction(consultationId),
        enabled: !!consultationId
    });
};

export const usePatientPrescriptions = (patientId: number) => {
    return useQuery({
        queryKey: ["patient-prescriptions", patientId],
        queryFn: () => getPrescriptionsByPatientIdAction(patientId),
        enabled: !!patientId
    });
};
