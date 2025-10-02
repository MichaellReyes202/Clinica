"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Calendar, MapPin, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface PatientFormProps {
  initialData?: {
    fullName?: string
    age?: string
    phone?: string
    email?: string
    address?: string
    bloodType?: string
    allergies?: string
    emergencyContact?: string
    emergencyPhone?: string
  }
  onSubmit?: (data: any) => void
  submitLabel?: string
}

export const PatientForm = ({ initialData, onSubmit, submitLabel = "Registrar Paciente" }: PatientFormProps) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    age: initialData?.age || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    bloodType: initialData?.bloodType || "",
    allergies: initialData?.allergies || "",
    emergencyContact: initialData?.emergencyContact || "",
    emergencyPhone: initialData?.emergencyPhone || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
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
          <CardTitle className="text-card-foreground">Información Personal</CardTitle>
          <CardDescription>Datos básicos del paciente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-card-foreground">
                Nombre Completo *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Juan Pérez García"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-card-foreground">
                Edad *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="35"
                  value={formData.age}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                  min="0"
                  max="150"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-card-foreground">
                Teléfono *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(505) 8765-4321"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Correo Electrónico *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="paciente@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-card-foreground">
              Dirección
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Calle Principal, Casa #123, Masaya"
                value={formData.address}
                onChange={handleChange}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Información Médica</CardTitle>
          <CardDescription>Datos médicos relevantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bloodType" className="text-card-foreground">
                Tipo de Sangre
              </Label>
              <Input
                id="bloodType"
                name="bloodType"
                type="text"
                placeholder="O+"
                value={formData.bloodType}
                onChange={handleChange}
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-card-foreground">
                Contacto de Emergencia
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="text"
                  placeholder="María Pérez"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone" className="text-card-foreground">
                Teléfono de Emergencia
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  placeholder="(505) 8765-4321"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="pl-10 bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-card-foreground">
              Alergias
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="allergies"
                name="allergies"
                placeholder="Penicilina, mariscos, etc."
                value={formData.allergies}
                onChange={handleChange}
                className="pl-10 bg-background text-foreground min-h-[100px]"
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
