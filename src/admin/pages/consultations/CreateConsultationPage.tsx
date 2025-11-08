" "

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Search } from "lucide-react"
import { PatientRecord } from "@/admin/components/PatientRecord"

const mockPatient = {
  id: "1",
  fullName: "María González Pérez",
  age: "45",
  bloodType: "O+",
  allergies: "Penicilina",
  phone: "(505) 8765-4321",
  email: "maria.gonzalez@ejemplo.com",
}

export default function CreateConsultationPage() {
  const [showPatientRecord, setShowPatientRecord] = useState(false)
  const [consultationData, setConsultationData] = useState({
    reason: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Consultation created:", consultationData)
    alert("Consulta registrada exitosamente")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FileText className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Crear Consulta</h2>
          <p className="text-muted-foreground">Registre una nueva consulta médica</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Seleccionar Paciente</CardTitle>
          <CardDescription>Busque el paciente para iniciar la consulta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar paciente por nombre..."
              className="pl-10 h-12 bg-background text-foreground"
            />
          </div>
          <Button
            onClick={() => setShowPatientRecord(true)}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            Cargar Expediente
          </Button>
        </CardContent>
      </Card>

      {/* Patient Record */}
      {showPatientRecord && <PatientRecord patient={mockPatient} />}

      {/* Consultation Form */}
      {showPatientRecord && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Datos de la Consulta</CardTitle>
              <CardDescription>Ingrese la información de la consulta médica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-card-foreground">
                  Motivo de Consulta *
                </Label>
                <Input
                  id="reason"
                  placeholder="Ej: Control de presión arterial"
                  value={consultationData.reason}
                  onChange={(e) => setConsultationData({ ...consultationData, reason: e.target.value })}
                  className="bg-background text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-card-foreground">
                  Síntomas
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describa los síntomas del paciente..."
                  value={consultationData.symptoms}
                  onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
                  className="bg-background text-foreground min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-card-foreground">
                  Diagnóstico *
                </Label>
                <Input
                  id="diagnosis"
                  placeholder="Ej: Hipertensión arterial controlada"
                  value={consultationData.diagnosis}
                  onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                  className="bg-background text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment" className="text-card-foreground">
                  Tratamiento
                </Label>
                <Textarea
                  id="treatment"
                  placeholder="Describa el tratamiento recomendado..."
                  value={consultationData.treatment}
                  onChange={(e) => setConsultationData({ ...consultationData, treatment: e.target.value })}
                  className="bg-background text-foreground min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-card-foreground">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones adicionales..."
                  value={consultationData.notes}
                  onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                  className="bg-background text-foreground min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="text-card-foreground border-border bg-transparent"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              Guardar Consulta
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
