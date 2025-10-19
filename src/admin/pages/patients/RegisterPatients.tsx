

import { PatientForm } from "@/admin/components/PatientForm";
import { UserPlus } from "lucide-react"
import { useNavigate } from "react-router"



export const RegisterPatients = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("Patient registered:", data)
    //alert("Paciente registrado exitosamente")
    //navigate("/dashboard/patients/search")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Registrar Paciente</h2>
          <p className="text-muted-foreground">Ingrese los datos del nuevo paciente</p>
        </div>
      </div>

      <PatientForm onSubmit={handleSubmit} submitLabel="Registrar Paciente" />
    </div>
  )
}
