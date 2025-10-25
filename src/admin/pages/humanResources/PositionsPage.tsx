




import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Plus, Edit, Loader } from "lucide-react"
import { useSpecialties, useSpecialtiesDetail } from "@/clinica/hooks/useSpecialties"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useQueryClient } from "@tanstack/react-query"
import { PositionForm } from "./components/PositionForm"


export const PositionsPage = () => {

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialtiesIdToEdit, setSpecialtiesIdToEdit] = useState<number | null>(null);



  const { data, isLoading } = useSpecialties();
  const { specialtie, isLoading: isLoadingDetail } = useSpecialtiesDetail(specialtiesIdToEdit);

  // --- Lógica del Modal ---
  const handleOpenCreate = () => {
    setSpecialtiesIdToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employeeId: number) => {
    setSpecialtiesIdToEdit(employeeId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSpecialtiesIdToEdit(null);
    queryClient.resetQueries({ queryKey: ["employeeDetail"] });
  };


  if (isLoading) {
    return <CustomFullScreenLoading />;
  }
  const items = Array.isArray(data?.items) ? data.items : [];

  return (

    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Especialidades Médicas</h2>
          <p className="text-muted-foreground">Gestione las especialidades disponibles en la clínica</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades Disponibles</CardTitle>
          <CardDescription>Lista de especialidades médicas en la clínica</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end">
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Especialidad
            </Button>
          </div>


          {isModalOpen && (
            <PositionForm
              initialSpecialties={specialtiesIdToEdit ? specialtie : null}
              onClose={handleCloseModal}
              isOpen={isModalOpen && !isLoadingDetail} // Espera a que cargue
            />
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especialidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Doctores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items!.map((specialty) => (
                <TableRow key={specialty.id.toString()}>
                  <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell>{specialty.description}</TableCell>
                  <TableCell>{specialty.employees} doctores</TableCell>
                  <TableCell>
                    <Badge variant={specialty.isActive ? "secondary" : "destructive"}>
                      {specialty.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(specialty.id)}>
                        {specialtiesIdToEdit === specialty.id ? (<Loader className="h-4 w-4 animate-spin" />) : (<Edit className="h-4 w-4" />)}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
