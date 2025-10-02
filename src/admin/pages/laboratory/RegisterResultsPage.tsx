

import { LabResultForm } from "@/admin/components/LabResultForm"
import { FlaskConical } from "lucide-react"
import { useNavigate } from "react-router"

export const RegisterResultsPage = () => {
  const navagate = useNavigate()

  const handleSubmit = (data: any) => {
    console.log("Lab results registered:", data)
    alert("Resultados registrados exitosamente")
    navagate("/dashboard/laboratory/history")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Registrar Resultados</h2>
          <p className="text-muted-foreground">Ingrese los resultados de exámenes de laboratorio</p>
        </div>
      </div>

      <LabResultForm onSubmit={handleSubmit} />
    </div>
  )
}
