"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

interface LabResultFormProps {
  examType?: string
  patientName?: string
  onSubmit?: (data: any) => void
}

export const LabResultForm = ({ examType, patientName, onSubmit }: LabResultFormProps) => {
  const [formData, setFormData] = useState({
    examType: examType || "",
    patientName: patientName || "",
    testDate: "",
    results: "",
    observations: "",
    referenceValues: "",
    status: "completed",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formData)
      }
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Información del Examen</CardTitle>
          <CardDescription>Complete los datos del examen de laboratorio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-card-foreground">
                Paciente *
              </Label>
              <Input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="Nombre del paciente"
                value={formData.patientName}
                onChange={handleChange}
                className="bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examType" className="text-card-foreground">
                Tipo de Examen *
              </Label>
              <select
                id="examType"
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 py-2"
                required
              >
                <option value="">Seleccionar examen</option>
                <option value="Hemograma completo">Hemograma completo</option>
                <option value="Glucosa en ayunas">Glucosa en ayunas</option>
                <option value="Perfil lipídico">Perfil lipídico</option>
                <option value="Examen general de orina">Examen general de orina</option>
                <option value="Perfil tiroideo">Perfil tiroideo</option>
                <option value="Perfil hepático">Perfil hepático</option>
                <option value="Perfil renal">Perfil renal</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testDate" className="text-card-foreground">
                Fecha del Examen *
              </Label>
              <Input
                id="testDate"
                name="testDate"
                type="date"
                value={formData.testDate}
                onChange={handleChange}
                className="bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-card-foreground">
                Estado *
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 py-2"
                required
              >
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Proceso</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="results" className="text-card-foreground">
              Resultados *
            </Label>
            <Textarea
              id="results"
              name="results"
              placeholder="Ingrese los resultados del examen..."
              value={formData.results}
              onChange={handleChange}
              className="bg-background text-foreground min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceValues" className="text-card-foreground">
              Valores de Referencia
            </Label>
            <Textarea
              id="referenceValues"
              name="referenceValues"
              placeholder="Valores normales de referencia..."
              value={formData.referenceValues}
              onChange={handleChange}
              className="bg-background text-foreground min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="text-card-foreground">
              Observaciones
            </Label>
            <Textarea
              id="observations"
              name="observations"
              placeholder="Observaciones adicionales..."
              value={formData.observations}
              onChange={handleChange}
              className="bg-background text-foreground min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Adjuntar Archivo (Opcional)</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="text-card-foreground border-border bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </Button>
              <span className="text-sm text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
            </div>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Registrar Resultados"}
        </Button>
      </div>
    </form>
  )
}
