

import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { PatientForm } from "@/admin/pages/patients/components/PatientForm";
import { useBloodTypeOption, useGenderOption } from "@/clinica/hooks/useCatalog";
import { usePatientDetail } from "@/clinica/hooks/usePatient";
import { UserPlus } from "lucide-react"
import { Navigate, useNavigate, useParams } from "react-router";

export const RegisterPatients = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patientDetail, isLoading: isLoadingPatientDetail } = usePatientDetail(id || 'new');
  const Title = id === 'new' ? 'Nuevo Paciente' : 'Editar Paciente';
  const Subtitle = id === 'new' ? 'Ingrese los datos del nuevo paciente' : 'Modifique los datos del paciente';
  const { data: sexoOptions, isLoading: isLoadingSexo } = useGenderOption();
  const { data: bloodTypeOptions, isLoading: isLoadingBloodType } = useBloodTypeOption();
  if (isLoadingSexo || isLoadingBloodType || isLoadingPatientDetail) {
    return <CustomFullScreenLoading />;
  }
  if (!patientDetail) {
    return <Navigate to="/dashboard/patients/search" replace />;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{Title}</h2>
          <p className="text-muted-foreground">{Subtitle}</p>
        </div>
      </div>

      <PatientForm
        initialPatient={patientDetail}
        onSuccess={() => navigate("/dashboard/patients/search")}
        sexoOptions={sexoOptions ?? []}
        bloodTypeOptions={bloodTypeOptions ?? []}
      />
    </div>
  )
}
