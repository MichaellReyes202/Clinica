import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    finalizeConsultationAction,
    getConsultationByAppointmentIdAction,
    rollbackConsultationAction,
    startConsultationAction
} from "../actions/Consultation.action";
import type { FinishConsultationDto, StartConsultationDto } from "@/interfaces/Consultation.response";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const useConsultationFlow = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const startMutation = useMutation({
        mutationFn: (dto: StartConsultationDto) => startConsultationAction(dto),
        onSuccess: (_, variables) => {
            toast.success("Consulta iniciada correctamente");
            queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            // Navigate to the consultation process page
            navigate(`/dashboard/consultations/process/${variables.appointmentId}`);
        },
        onError: (error) => {
            console.error("Error starting consultation:", error);
            toast.error("Error al iniciar la consulta");
        }
    });

    const finalizeMutation = useMutation({
        mutationFn: (dto: FinishConsultationDto) => finalizeConsultationAction(dto),
        onSuccess: () => {
            toast.success("Consulta finalizada correctamente");
            queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            navigate("/dashboard/appointments/today");
        },
        onError: (error) => {
            console.error("Error finalizing consultation:", error);
            toast.error("Error al finalizar la consulta");
        }
    });

    const rollbackMutation = useMutation({
        mutationFn: (consultationId: number) => rollbackConsultationAction(consultationId),
        onSuccess: () => {
            toast.success("Consulta cancelada y revertida");
            queryClient.invalidateQueries({ queryKey: ["today-appointments"] });
            navigate("/dashboard/appointments/today");
        },
        onError: (error) => {
            console.error("Error rolling back consultation:", error);
            toast.error("Error al cancelar la consulta");
        }
    });

    return {
        startConsultation: startMutation.mutate,
        isStarting: startMutation.isPending,
        finalizeConsultation: finalizeMutation.mutate,
        isFinalizing: finalizeMutation.isPending,
        rollbackConsultation: rollbackMutation.mutate,
        isRollingBack: rollbackMutation.isPending
    };
};

export const useConsultationDetail = (appointmentId: number) => {
    return useQuery({
        queryKey: ["consultation-detail", appointmentId],
        queryFn: () => getConsultationByAppointmentIdAction(appointmentId),
        enabled: !!appointmentId,
        retry: false
    });
};
