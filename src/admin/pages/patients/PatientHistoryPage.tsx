import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { usePatientDetail } from "@/clinica/hooks/usePatient";
import { PatientHistoryContent } from "./components/PatientHistoryContent";

export const PatientHistoryPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // Hooks for data
    const { patient, isLoading: isLoadingPatient } = usePatientDetail(patientId || null);

    if (isLoadingPatient) return <CustomFullScreenLoading />;

    if (!patient) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2 className="text-2xl font-bold text-muted-foreground">Paciente no encontrado</h2>
            <Button onClick={() => navigate(-1)}>Regresar</Button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Historial Médico</h1>
                    <p className="text-muted-foreground">Expediente Clínico Digital</p>
                </div>
            </div>

            <PatientHistoryContent patientId={Number(patientId)} />
        </div>
    );
};