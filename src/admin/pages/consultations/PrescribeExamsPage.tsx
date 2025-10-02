

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FlaskConical, FileText } from "lucide-react"

const availableExams = [
  { id: "hemograma", name: "Hemograma completo", category: "Hematología" },
  { id: "glucosa", name: "Glucosa en ayunas", category: "Química sanguínea" },
  { id: "lipidos", name: "Perfil lipídico", category: "Química sanguínea" },
  { id: "orina", name: "Examen general de orina", category: "Urianálisis" },
  { id: "tiroides", name: "Perfil tiroideo (TSH, T3, T4)", category: "Endocrinología" },
  { id: "hepatico", name: "Perfil hepático", category: "Química sanguínea" },
  { id: "renal", name: "Perfil renal", category: "Química sanguínea" },
  { id: "electrolitos", name: "Electrolitos séricos", category: "Química sanguínea" },
]

export const PrescribeExamsPage = () => {
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [instructions, setInstructions] = useState("")

  const toggleExam = (examId: string) => {
    setSelectedExams((prev) => (prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]))
  }

  const handleSubmit = () => {
    console.log("Exams prescribed:", { selectedExams, instructions })
    alert("Exámenes prescritos exitosamente")
  }

  const groupedExams = availableExams.reduce(
    (acc, exam) => {
      if (!acc[exam.category]) {
        acc[exam.category] = []
      }
      acc[exam.category].push(exam)
      return acc
    },
    {} as Record<string, typeof availableExams>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Prescribir Exámenes</h2>
          <p className="text-muted-foreground">Seleccione los exámenes de laboratorio necesarios</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Información del Paciente</CardTitle>
          <CardDescription>María González Pérez - 45 años</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha:</span>
              <span className="ml-2 text-card-foreground">30 Sep 2025</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>
              <span className="ml-2 text-card-foreground">Dr. Juan Pérez</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Exámenes Disponibles</CardTitle>
          <CardDescription>Seleccione los exámenes que desea prescribir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedExams).map(([category, exams]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-card-foreground">{category}</h3>
              <div className="space-y-2 ml-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={exam.id}
                      checked={selectedExams.includes(exam.id)}
                      onCheckedChange={() => toggleExam(exam.id)}
                      className="border-border data-[state=checked]:bg-sidebar-primary data-[state=checked]:border-sidebar-primary"
                    />
                    <Label
                      htmlFor={exam.id}
                      className="text-sm font-normal text-card-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {exam.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedExams.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Indicaciones para el Paciente</CardTitle>
            <CardDescription>Instrucciones especiales para la realización de los exámenes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-card-foreground">
                Instrucciones
              </Label>
              <Textarea
                id="instructions"
                placeholder="Ej: Presentarse en ayunas de 8-12 horas..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="bg-background text-foreground min-h-[100px]"
              />
            </div>

            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm font-medium text-card-foreground mb-2">
                Exámenes seleccionados: {selectedExams.length}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedExams.map((examId) => {
                  const exam = availableExams.find((e) => e.id === examId)
                  return <li key={examId}>• {exam?.name}</li>
                })}
              </ul>
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
                onClick={handleSubmit}
                className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                Prescribir Exámenes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
