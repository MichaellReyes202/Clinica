" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Plus, Edit, Trash2, } from "lucide-react"
import { useExamsBySpecialty } from "@/clinica/hooks/useExamType"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CustomPagination } from "@/components/custom/CustomPagination"



export const ManageExamsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  //const [exams, setExams] = useState(mockExamCatalog)

  const { data, isLoading } = useExamsBySpecialty();

  if (isLoading) {
    return <CustomFullScreenLoading />
  }

  const exams = data?.items || [];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-chart-1" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestión de Exámenes</h2>
            <p className="text-muted-foreground">Administre el catálogo de exámenes disponibles</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Examen
        </Button>
      </div>

      {/* Add Exam Form */}
      {showAddForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Agregar Nuevo Examen</CardTitle>
            <CardDescription>Complete la información del nuevo examen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="examName" className="text-card-foreground">
                  Nombre del Examen *
                </Label>
                <Input id="examName" placeholder="Ej: Hemograma completo" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-card-foreground">
                  Categoría *
                </Label>
                <select id="category" className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 py-2" >
                  <option value="">Seleccionar categoría</option>
                  <option value="Hematología">Hematología</option>
                  <option value="Química sanguínea">Química sanguínea</option>
                  <option value="Urianálisis">Urianálisis</option>
                  <option value="Endocrinología">Endocrinología</option>
                  <option value="Microbiología">Microbiología</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-card-foreground">
                  Precio *
                </Label>
                <Input id="price" type="text" placeholder="$0.00" className="bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turnaround" className="text-card-foreground">
                  Tiempo de Entrega *
                </Label>
                <Input id="turnaround" placeholder="Ej: 24 horas" className="bg-background text-foreground" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-card-foreground border-border bg-transparent">
                Cancelar
              </Button>
              <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                Guardar Examen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catalogo de examenes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Catálogo de Exámenes</CardTitle>
          <CardDescription>{exams.length} exámenes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">

            <Accordion type="single" className="w-full" defaultValue={exams[0].name}>

              {
                exams.map((ex) => (
                  <AccordionItem value={ex.name}>
                    <AccordionTrigger>{ex.name}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      {ex.examTypes.map((exam) => (
                        <div key={exam.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <FlaskConical className="h-5 w-5 text-chart-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-semibold text-card-foreground">{exam.name}</h3>
                                  {exam.isActive ?
                                    (<Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30"> Activo</Badge>) :
                                    (<Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Inactivo</Badge>)
                                  }
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                  <span>Precio: {exam.pricePaid}</span>
                                  <span>Entrega: {exam.deliveryTime}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" className="text-card-foreground border-border bg-transparent" title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-destructive border-border bg-transparent hover:bg-destructive/10" title="Eliminar">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
            </Accordion>
          </div>
        </CardContent>
      </Card>
      <CustomPagination totalPages={data?.pages || 0} />
    </div>
  )
}
