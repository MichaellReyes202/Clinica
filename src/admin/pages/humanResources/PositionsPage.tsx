




import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Loader, Contact, Search } from "lucide-react"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useQueryClient } from "@tanstack/react-query"
import { PositionForm } from "./components/PositionForm"
import { usePositionDetail, usePositions } from "@/clinica/hooks/usePosition"
import { Input } from "@/components/ui/input"
import { CustomPagination } from "@/components/custom/CustomPagination"


export const PositionsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positionIdToEdit, setPositionIdToEdit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const { data, isLoading } = usePositions()
  const { position, isLoading: isLoadingDetail } = usePositionDetail(positionIdToEdit);
  const handleOpenCreate = () => {
    setPositionIdToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (positionId: number) => {
    setPositionIdToEdit(positionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPositionIdToEdit(null);
    queryClient.resetQueries({ queryKey: ["employeeDetail"] });
  };
  if (isLoading) {
    return <CustomFullScreenLoading />;
  }
  const filteredPosition = (data?.items || []).filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term)
    );
  });

  return (

    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Contact className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cargos</h2>
          <p className="text-muted-foreground">Gestione los cargos disponibles en la clínica</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cargos Disponibles</CardTitle>
          <CardDescription>Lista de cargos disponibles</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cargo" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nuevo Cargo
            </Button>
          </div>

          {isModalOpen && (
            <PositionForm
              initialPosition={positionIdToEdit ? position : null}
              onClose={handleCloseModal}
              isOpen={isModalOpen && !isLoadingDetail} // Espera a que cargue
            />
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Empleados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosition!.map((pos) => (
                <TableRow key={pos.id.toString()}>
                  <TableCell className="font-medium">{pos.name}</TableCell>
                  <TableCell>{pos.description}</TableCell>
                  <TableCell>{pos.employees} doctores</TableCell>
                  <TableCell>
                    <Badge variant={pos.isActive ? "secondary" : "destructive"}>
                      {pos.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(pos.id)}>
                        {positionIdToEdit === pos.id ? (<Loader className="h-4 w-4 animate-spin" />) : (<Edit className="h-4 w-4" />)}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CustomPagination totalPages={data?.pages || 0} />
    </div>
  )
}
