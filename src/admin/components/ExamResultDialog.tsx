import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExamPendingDto } from "@/interfaces/Laboratory.response";

interface ExamResultDialogProps {
    exam: ExamPendingDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ExamResultDialog = ({ exam, open, onOpenChange }: ExamResultDialogProps) => {
    if (!exam) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Resultados de Examen</DialogTitle>
                    <DialogDescription>
                        Detalles y resultados del examen seleccionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <span className="text-sm text-gray-500 block">Examen</span>
                            <span className="font-medium">{exam.examTypeName}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Fecha</span>
                            <span className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Paciente</span>
                            <span className="font-medium">{exam.patientName}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Estado</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{exam.statusName}</Badge>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-gray-900">Resultados / Observaciones</h4>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-white">
                            <div className="whitespace-pre-wrap text-sm text-gray-700">
                                {exam.results || "Sin resultados registrados."}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
