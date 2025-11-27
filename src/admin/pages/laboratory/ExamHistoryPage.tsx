import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Eye, Download, Calendar as CalendarIcon, User, LayoutGrid, List, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSpecialtiesOption } from "@/clinica/hooks/useSpecialties"
import { FilterSection } from "@/admin/components/filters/FilterSection"
import { useUrlFilters } from "@/clinica/hooks/useUrlFilters"

// Estados de exámenes
// 1 - Programado
// 2 - Realizado  
// 3 - En Proceso
// 4 - Cancelado

const mockExamHistory = [
   {
      id: "1",
      patient: "María González Pérez",
      examType: "Hemograma completo",
      specialty: "Hematología",
      date: "2025-11-28",
      statusId: 2, // Realizado
      results: "Valores normales. Hemoglobina: 13.5 g/dL, Leucocitos: 7,200/μL, Plaquetas: 250,000/μL",
      doctor: "Dr. Juan Pérez",
   },
   {
      id: "2",
      patient: "Carlos Ruiz Martínez",
      examType: "Glucosa en ayunas",
      specialty: "Endocrinología",
      date: "2025-11-27",
      statusId: 2, // Realizado
      results: "95 mg/dL - Valor normal",
      doctor: "Dra. Ana López",
   },
   {
      id: "3",
      patient: "Ana Martínez López",
      examType: "Perfil lipídico",
      specialty: "Cardiología",
      date: "2025-11-26",
      statusId: 3, // En Proceso
      results: "Procesando muestras...",
      doctor: "Dr. Juan Pérez",
   },
   {
      id: "4",
      patient: "José López García",
      examType: "Perfil tiroideo",
      specialty: "Endocrinología",
      date: "2025-11-25",
      statusId: 1, // Programado
      results: "Programado para mañana",
      doctor: "Dr. Roberto Silva",
   },
   {
      id: "5",
      patient: "Laura Pérez Ramírez",
      examType: "Examen general de orina",
      specialty: "Nefrología",
      date: "2025-11-24",
      statusId: 2, // Realizado
      results: "Aspecto: claro, Color: amarillo, pH: 6.0, Proteínas: negativo, Glucosa: negativo",
      doctor: "Dra. Ana López",
   },
   {
      id: "6",
      patient: "Pedro Ramírez Castro",
      examType: "Perfil hepático",
      specialty: "Gastroenterología",
      date: "2025-11-23",
      statusId: 1, // Programado
      results: "Programado para el 25/11",
      doctor: "Dr. Juan Pérez",
   },
   {
      id: "7",
      patient: "Sofía Hernández",
      examType: "Radiografía de tórax",
      specialty: "Radiología",
      date: "2025-11-22",
      statusId: 4, // Cancelado
      results: "Cancelado por el paciente",
      doctor: "Dr. Carlos Méndez",
   },
   {
      id: "8",
      patient: "Roberto Díaz",
      examType: "Electrocardiograma",
      specialty: "Cardiología",
      date: "2025-11-21",
      statusId: 3, // En Proceso
      results: "En análisis por el cardiólogo",
      doctor: "Dra. Patricia Gómez",
   },
]

type ViewMode = "cards" | "list"

export const ExamHistoryPage = () => {
   const [viewMode, setViewMode] = useState<ViewMode>("cards")

   // Obtener filtros desde URL
   const { filters, hasActiveFilters, clearFilters } = useUrlFilters();

   const { data: specialties } = useSpecialtiesOption()
   const specialtyOptions = specialties || []

   // Opciones de estado para exámenes
   const examStatusOptions = [
      { value: "1", label: "Programado" },
      { value: "2", label: "Realizado" },
      { value: "3", label: "En Proceso" },
      { value: "4", label: "Cancelado" },
   ];

   // El backend filtra los datos según los query params,
   // por ahora usamos mock data sin filtrar (reemplazar con datos del backend)
   const filteredExams = mockExamHistory;


   const getStatusBadge = (statusId: number) => {
      switch (statusId) {
         case 1:
            return (<Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30"> Programado </Badge>)
         case 2:
            return (<Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30"> Realizado </Badge>)
         case 3:
            return (<Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"> En Proceso </Badge>)
         case 4:
            return (<Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30"> Cancelado </Badge>)
         default:
            return null
      }
   }

   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-enter justify-center">
               <FlaskConical className="h-5 w-5 text-chart-1" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-foreground">Historial de Exámenes</h2>
               <p className="text-muted-foreground">Consulte los resultados de exámenes realizados</p>
            </div>
         </div>

         {/* Filters Area */}
         <FilterSection
            statusOptions={examStatusOptions}
            specialtyOptions={specialtyOptions}
         />

         {/* Results Header with View Toggle */}
         <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
               {filteredExams.length} {filteredExams.length === 1 ? "examen encontrado" : "exámenes encontrados"}
            </p>

            <div className="flex gap-2">
               <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="gap-2"
               >
                  <LayoutGrid className="h-4 w-4" />
                  Cards
               </Button>
               <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
               >
                  <List className="h-4 w-4" />
                  Lista
               </Button>
            </div>
         </div>

         {/* Content - Cards or List View */}
         {filteredExams.length > 0 ? (
            viewMode === "cards" ? (
               // Cards View
               <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {filteredExams.map((exam) => (
                     <Card key={exam.id} className="bg-card border-border hover:shadow-lg transition-shadow">
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
                                          {getStatusBadge(exam.statusId)}
                                       </div>
                                       <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                          <div className="flex items-center gap-1">
                                             <User className="h-4 w-4" />
                                             <span>{exam.patient}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                             <CalendarIcon className="h-4 w-4" />
                                             <span>{formatDate(exam.date)}</span>
                                          </div>
                                       </div>
                                       <div className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium">Especialidad:</span> {exam.specialty}
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

                              <div className="flex flex-col gap-2">
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
               // List/Table View
               <Card className="bg-card border-border">
                  <CardContent className="p-0">
                     <div className="overflow-x-auto">
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Paciente</TableHead>
                                 <TableHead>Examen</TableHead>
                                 <TableHead>Especialidad</TableHead>
                                 <TableHead>Fecha</TableHead>
                                 <TableHead>Estado</TableHead>
                                 <TableHead>Médico</TableHead>
                                 <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredExams.map((exam) => (
                                 <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.patient}</TableCell>
                                    <TableCell>{exam.examType}</TableCell>
                                    <TableCell>{exam.specialty}</TableCell>
                                    <TableCell>{formatDate(exam.date)}</TableCell>
                                    <TableCell>{getStatusBadge(exam.statusId)}</TableCell>
                                    <TableCell className="text-muted-foreground">{exam.doctor}</TableCell>
                                    <TableCell className="text-right">
                                       <div className="flex justify-end gap-2">
                                          <Button variant="ghost" size="icon" title="Ver detalles">
                                             <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" title="Descargar">
                                             <Download className="h-4 w-4" />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </CardContent>
               </Card>
            )
         ) : (
            // Empty State
            <div className="text-center py-12">
               <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-card-foreground mb-2">No se encontraron exámenes</h3>
               <p className="text-muted-foreground mb-4">
                  {hasActiveFilters ? "Intente ajustar los filtros" : "No hay exámenes registrados"}
               </p>
               {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                     <X className="h-4 w-4" />
                     Limpiar Filtros
                  </Button>
               )}
            </div>
         )}
      </div>
   )
}
