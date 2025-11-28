import { useQuery } from "@tanstack/react-query";
import { getConsultationsByPatientIdAction } from "../actions/Consultation.action";
import { getExamsByPatientIdAction } from "../actions/Laboratory.action";

export const usePatientHistory = (patientId: number) => {
    const consultationsQuery = useQuery({
        queryKey: ["patient-consultations", patientId],
        queryFn: () => getConsultationsByPatientIdAction(patientId),
        enabled: !!patientId
    });

    const examsQuery = useQuery({
        queryKey: ["patient-exams", patientId],
        queryFn: () => getExamsByPatientIdAction(patientId),
        enabled: !!patientId
    });

    return {
        consultations: consultationsQuery.data || [],
        isLoadingConsultations: consultationsQuery.isLoading,
        exams: examsQuery.data || [],
        isLoadingExams: examsQuery.isLoading,
        refetchHistory: () => {
            consultationsQuery.refetch();
            examsQuery.refetch();
        }
    };
};
