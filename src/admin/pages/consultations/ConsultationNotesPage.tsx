" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Save } from "lucide-react"

export const ConsultationNotesPage = () => {
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    console.log("Notes saved:", notes)
    alert("Notas guardadas exitosamente")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FileText className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ingresar Notas</h2>
          <p className="text-muted-foreground">Agregue notas médicas a la consulta</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Notas Médicas</CardTitle>
          <CardDescription>Paciente: María González Pérez - Consulta del 30 Sep 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-card-foreground">
              Notas de la Consulta
            </Label>
            <Textarea
              id="notes"
              placeholder="Ingrese las notas médicas detalladas de la consulta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background text-foreground min-h-[300px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="text-card-foreground border-border bg-transparent"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Notas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
