
import { PrescriptionGenerator } from "@/admin/components/PrescriptionGenerator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, Printer } from "lucide-react"

export default function PrescriptionPage() {
  const handlePrint = () => {
    alert("Generando receta para imprimir...")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Pill className="h-5 w-5 text-chart-1" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Generar Receta</h2>
            <p className="text-muted-foreground">Cree una receta médica para el paciente</p>
          </div>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Receta
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Información del Paciente</CardTitle>
          <CardDescription>María González Pérez - 45 años</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha:</span>
              <span className="ml-2 text-card-foreground">30 Sep 2025</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>
              <span className="ml-2 text-card-foreground">Dr. Juan Pérez</span>
            </div>
            <div>
              <span className="text-muted-foreground">Diagnóstico:</span>
              <span className="ml-2 text-card-foreground">Hipertensión arterial</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PrescriptionGenerator />
    </div>
  )
}
