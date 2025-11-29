import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { useExamTypeSearch } from "../hooks/useExamType";
import { useLaboratory } from "../hooks/useLaboratory";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderExamDialogProps {
    appointmentId: number;
    consultationId?: number;
}

export const OrderExamDialog = ({ appointmentId, consultationId }: OrderExamDialogProps) => {
    const [open, setOpen] = useState(false);
    const [selectedExams, setSelectedExams] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // We need to handle search params for the hook, but here we are inside a component.
    // The hook useExamType uses useSearchParams directly. 
    // Ideally we should refactor useExamType to accept params, but for now we might need to rely on the hook's behavior or create a new one.
    // Let's assume we can't easily change useExamType right now without breaking other things.
    // Actually, looking at useExamType, it reads from URL. This is bad for a modal.
    // I'll create a local version of the query here or just use the existing one if it fits, but it won't filter by local state.
    // I'll use a simple fetch or a new hook if needed. 
    // For now, let's try to use the existing hook but we might need to update the URL which is not ideal for a modal.
    // Let's create a specific hook for this or just use useQuery directly here for simplicity.

    // RE-READING useExamType: it accepts no arguments.
    // I will implement a direct query here to avoid messing with URL.

    // Wait, I can't easily import the action if it's not exported or if I don't want to duplicate logic.
    // I'll check if getExamTypeAction is exported. Yes it is.

    const { createOrder, isCreatingOrder } = useLaboratory();

    // Custom query for the dialog
    const { data: examTypesData, isLoading } = useExamTypeSearch(searchTerm);

    const toggleExam = (id: number) => {
        setSelectedExams(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (selectedExams.length === 0) return;
        createOrder({
            appointmentId,
            consultationId,
            examTypeIds: selectedExams
        }, {
            onSuccess: () => {
                setOpen(false);
                setSelectedExams([]);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Solicitar Exámenes
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Solicitar Exámenes de Laboratorio</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar examen..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-md p-2">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-2">
                                {examTypesData?.items.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${selectedExams.includes(exam.id) ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                                        onClick={() => toggleExam(exam.id)}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{exam.name}</p>
                                            <p className="text-xs text-muted-foreground">{exam.specialtyName}</p>
                                        </div>
                                        {selectedExams.includes(exam.id) && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={selectedExams.length === 0 || isCreatingOrder}>
                            {isCreatingOrder && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Solicitar ({selectedExams.length})
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
