import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExamOrderAction, processExamAction } from "../actions/Laboratory.action";
import { ExamOrderDto, ExamProcessDto } from "@/interfaces/Laboratory.response";
import { toast } from "sonner";

export const useLaboratory = () => {
    const queryClient = useQueryClient();

    const createOrderMutation = useMutation({
        mutationFn: (dto: ExamOrderDto) => createExamOrderAction(dto),
        onSuccess: () => {
            toast.success("Orden de exámenes creada correctamente");
            queryClient.invalidateQueries({ queryKey: ["patient-exams"] });
            queryClient.invalidateQueries({ queryKey: ["exams-by-appointment"] });
        },
        onError: (error) => {
            console.error("Error creating exam order:", error);
            toast.error("Error al crear la orden de exámenes");
        }
    });

    const processExamMutation = useMutation({
        mutationFn: (dto: ExamProcessDto) => processExamAction(dto),
        onSuccess: () => {
            toast.success("Examen procesado correctamente");
            queryClient.invalidateQueries({ queryKey: ["pending-exams"] });
        },
        onError: (error) => {
            console.error("Error processing exam:", error);
            toast.error("Error al procesar el examen");
        }
    });

    return {
        createOrder: createOrderMutation.mutate,
        isCreatingOrder: createOrderMutation.isPending,
        processExam: processExamMutation.mutate,
        isProcessingExam: processExamMutation.isPending
    };
};
