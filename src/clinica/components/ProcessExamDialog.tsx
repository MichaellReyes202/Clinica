import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useLaboratory } from "../hooks/useLaboratory";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExamPendingDto } from "@/interfaces/Laboratory.response";

interface ProcessExamDialogProps {
    exam: ExamPendingDto;
    trigger?: React.ReactNode;
}

export const ProcessExamDialog = ({ exam, trigger }: ProcessExamDialogProps) => {
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState("");
    const { processExam, isProcessingExam } = useLaboratory();

    const handleSubmit = () => {
        if (!results.trim()) return;
        processExam({
            examId: exam.id,
            results: results
        }, {
            onSuccess: () => {
                setOpen(false);
                setResults("");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button size="sm">Procesar</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Resultados: {exam.examTypeName}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="text-sm text-muted-foreground">
                        <p>Paciente: {exam.patientName}</p>
                        <p>Fecha: {new Date(exam.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Resultados / Informe</Label>
                        <Textarea
                            value={results}
                            onChange={(e) => setResults(e.target.value)}
                            placeholder="Ingrese los resultados del examen..."
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={!results.trim() || isProcessingExam}>
                            {isProcessingExam && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Resultados
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
