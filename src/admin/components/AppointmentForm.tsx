

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { User, Stethoscope, Calendar, FileText } from "lucide-react"

interface AppointmentFormProps {
  initialData?: {
    patientName?: string
    doctor?: string
    specialty?: string
    date?: string
    time?: string
    reason?: string
  }
  onSubmit?: (data: any) => void
  submitLabel?: string
}

export const AppointmentForm = ({ initialData, onSubmit, submitLabel = "Agendar Cita" }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || "",
    doctor: initialData?.doctor || "",
    specialty: initialData?.specialty || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    reason: initialData?.reason || "",
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
          <CardTitle className="text-card-foreground">Información de la Cita</CardTitle>
          <CardDescription>Complete los datos para agendar la cita</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-card-foreground">
                Paciente *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="patientName"
                  name="patientName"
                  type="text"
                  placeholder="Buscar paciente..."
                  value={formData.patientName}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor" className="text-card-foreground">
                Doctor *
              </Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full pl-10 h-10 rounded-md border border-input bg-background text-foreground px-3 py-2"
                  required
                >
                  <option value="">Seleccionar doctor</option>
                  <option value="Dr. Juan Pérez">Dr. Juan Pérez</option>
                  <option value="Dra. Ana López">Dra. Ana López</option>
                  <option value="Dr. Roberto Silva">Dr. Roberto Silva</option>
                  <option value="Dra. Carmen Díaz">Dra. Carmen Díaz</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-card-foreground">
                Especialidad *
              </Label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 py-2"
                required
              >
                <option value="">Seleccionar especialidad</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Dermatología">Dermatología</option>
                <option value="Ginecología">Ginecología</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-card-foreground">
                Fecha *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-card-foreground">
                Hora *
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-card-foreground">
              Motivo de la Consulta *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="reason"
                name="reason"
                placeholder="Describa el motivo de la consulta..."
                value={formData.reason}
                onChange={handleChange}
                className="pl-10 bg-background text-foreground min-h-[100px]"
                required
              />
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
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
