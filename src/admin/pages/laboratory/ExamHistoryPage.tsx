" "

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FlaskConical, Eye, Download, Calendar, User } from "lucide-react"

const mockExamHistory = [
  {
    id: "1",
    patient: "María González Pérez",
    examType: "Hemograma completo",
    date: "28 Sep 2025",
    status: "completed",
    results: "Valores normales. Hemoglobina: 13.5 g/dL, Leucocitos: 7,200/μL, Plaquetas: 250,000/μL",
    doctor: "Dr. Juan Pérez",
  },
  {
    id: "2",
    patient: "Carlos Ruiz Martínez",
    examType: "Glucosa en ayunas",
    date: "27 Sep 2025",
    status: "completed",
    results: "95 mg/dL - Valor normal",
    doctor: "Dra. Ana López",
  },
  {
    id: "3",
    patient: "Ana Martínez López",
    examType: "Perfil lipídico",
    date: "26 Sep 2025",
    status: "completed",
    results: "Colesterol total: 180 mg/dL, HDL: 55 mg/dL, LDL: 110 mg/dL, Triglicéridos: 120 mg/dL",
    doctor: "Dr. Juan Pérez",
  },
  {
    id: "4",
    patient: "José López García",
    examType: "Perfil tiroideo",
    date: "25 Sep 2025",
    status: "completed",
    results: "TSH: 2.5 mIU/L, T3: 120 ng/dL, T4: 8.5 μg/dL - Valores normales",
    doctor: "Dr. Roberto Silva",
  },
  {
    id: "5",
    patient: "Laura Pérez Ramírez",
    examType: "Examen general de orina",
    date: "24 Sep 2025",
    status: "completed",
    results: "Aspecto: claro, Color: amarillo, pH: 6.0, Proteínas: negativo, Glucosa: negativo",
    doctor: "Dra. Ana López",
  },
  {
    id: "6",
    patient: "Pedro Ramírez Castro",
    examType: "Perfil hepático",
    date: "23 Sep 2025",
    status: "pending",
    results: "Pendiente de procesamiento",
    doctor: "Dr. Juan Pérez",
  },
]

export const ExamHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredExams, setFilteredExams] = useState(mockExamHistory)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredExams(mockExamHistory)
    } else {
      const filtered = mockExamHistory.filter(
        (exam) =>
          exam.patient.toLowerCase().includes(query.toLowerCase()) ||
          exam.examType.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredExams(filtered)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            Completado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pendiente
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            En Proceso
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Historial de Exámenes</h2>
          <p className="text-muted-foreground">Consulte los resultados de exámenes realizados</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por paciente o tipo de examen..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-lg bg-card text-card-foreground border-border"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredExams.length} {filteredExams.length === 1 ? "examen encontrado" : "exámenes encontrados"}
        </p>
      </div>

      {/* Exam History List */}
      {filteredExams.length > 0 ? (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                      <FlaskConical className="h-6 w-6 text-chart-1" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold text-card-foreground">{exam.examType}</h3>
                          {getStatusBadge(exam.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{exam.patient}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{exam.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-sm font-medium text-card-foreground mb-1">Resultados:</p>
                        <p className="text-sm text-muted-foreground">{exam.results}</p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span>Solicitado por: {exam.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-card-foreground border-border bg-transparent"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-card-foreground border-border bg-transparent"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No se encontraron exámenes</h3>
          <p className="text-muted-foreground">Intente con otro término de búsqueda</p>
        </div>
      )}
    </div>
  )
}
