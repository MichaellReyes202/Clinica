

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, FileText, FlaskConical, Pill, ChevronDown, ChevronUp } from "lucide-react"

interface PatientRecordProps {
  patient: {
    id: string
    fullName: string
    age: string
    bloodType: string
    allergies: string
    phone: string
    email: string
  }
}

export const PatientRecord = ({ patient }: PatientRecordProps) => {
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null)

  const consultations = [
    {
      id: "1",
      date: "29 Sep 2025",
      doctor: "Dr. Juan Pérez",
      reason: "Control de presión arterial",
      diagnosis: "Hipertensión arterial controlada",
      notes:
        "Paciente presenta presión arterial de 130/85 mmHg. Continuar con tratamiento actual. Se recomienda dieta baja en sodio y ejercicio regular.",
      treatment: "Losartán 50mg, 1 tableta diaria",
    },
    {
      id: "2",
      date: "15 Sep 2025",
      doctor: "Dr. Juan Pérez",
      reason: "Consulta general - dolor de cabeza",
      diagnosis: "Cefalea tensional",
      notes:
        "Paciente refiere dolor de cabeza recurrente, especialmente al final del día. Sin signos de alarma. Se recomienda manejo del estrés.",
      treatment: "Ibuprofeno 400mg según necesidad",
    },
    {
      id: "3",
      date: "01 Sep 2025",
      doctor: "Dra. Ana López",
      reason: "Revisión de exámenes",
      diagnosis: "Valores normales",
      notes: "Resultados de laboratorio dentro de parámetros normales. Continuar con controles periódicos.",
      treatment: "Ninguno",
    },
  ]

  const exams = [
    {
      id: "1",
      date: "28 Ago 2025",
      type: "Hemograma completo",
      status: "Completado",
      results: "Valores normales",
    },
    {
      id: "2",
      date: "28 Ago 2025",
      type: "Perfil lipídico",
      status: "Completado",
      results: "Colesterol total: 180 mg/dL (Normal)",
    },
    {
      id: "3",
      date: "15 Ago 2025",
      type: "Glucosa en ayunas",
      status: "Completado",
      results: "95 mg/dL (Normal)",
    },
  ]

  const prescriptions = [
    {
      id: "1",
      date: "29 Sep 2025",
      doctor: "Dr. Juan Pérez",
      medications: [{ name: "Losartán 50mg", dosage: "1 tableta diaria", duration: "30 días" }],
    },
    {
      id: "2",
      date: "15 Sep 2025",
      doctor: "Dr. Juan Pérez",
      medications: [{ name: "Ibuprofeno 400mg", dosage: "1 tableta cada 8 horas", duration: "Según necesidad" }],
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <User className="h-8 w-8 text-chart-1" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl text-card-foreground">{patient.fullName}</CardTitle>
            <CardDescription className="mt-1">Expediente Médico</CardDescription>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {patient.age} años
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Tipo: {patient.bloodType}
              </Badge>
              {patient.allergies && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Alergias: {patient.allergies}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
            >
              <User className="h-4 w-4 mr-2" />
              Datos
            </TabsTrigger>
            <TabsTrigger
              value="consultations"
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Consultas
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Exámenes
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
            >
              <Pill className="h-4 w-4 mr-2" />
              Recetas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="text-card-foreground font-medium">{patient.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                <p className="text-card-foreground font-medium">{patient.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tipo de Sangre</p>
                <p className="text-card-foreground font-medium">{patient.bloodType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Edad</p>
                <p className="text-card-foreground font-medium">{patient.age} años</p>
              </div>
            </div>
            {patient.allergies && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-400 mb-1">Alergias Conocidas</p>
                <p className="text-card-foreground">{patient.allergies}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="consultations" className="space-y-3 mt-4">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedConsultation(expandedConsultation === consultation.id ? null : consultation.id)
                  }
                  className="w-full p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-chart-1" />
                      <div>
                        <p className="font-medium text-card-foreground">{consultation.date}</p>
                        <p className="text-sm text-muted-foreground">{consultation.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {consultation.reason}
                      </Badge>
                      {expandedConsultation === consultation.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>
                {expandedConsultation === consultation.id && (
                  <div className="p-4 space-y-3 bg-card">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Diagnóstico</p>
                      <p className="text-card-foreground">{consultation.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notas Médicas</p>
                      <p className="text-card-foreground">{consultation.notes}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Tratamiento</p>
                      <p className="text-card-foreground">{consultation.treatment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="exams" className="space-y-3 mt-4">
            {exams.map((exam) => (
              <div key={exam.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FlaskConical className="h-5 w-5 text-chart-1 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{exam.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">{exam.date}</p>
                      <div className="mt-2 p-2 rounded bg-secondary/50">
                        <p className="text-sm text-card-foreground">{exam.results}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    {exam.status}
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-3 mt-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                <div className="flex items-start gap-3 mb-3">
                  <Pill className="h-5 w-5 text-chart-1 mt-1" />
                  <div>
                    <p className="font-medium text-card-foreground">{prescription.date}</p>
                    <p className="text-sm text-muted-foreground">{prescription.doctor}</p>
                  </div>
                </div>
                <div className="space-y-2 ml-8">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="p-3 rounded bg-secondary/50">
                      <p className="font-medium text-card-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Dosis: {med.dosage}</p>
                      <p className="text-sm text-muted-foreground">Duración: {med.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
