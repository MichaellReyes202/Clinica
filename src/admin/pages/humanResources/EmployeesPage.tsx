"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Plus, Loader } from "lucide-react"

import { useEmployes } from "@/clinica/hooks/useEmployes"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { EmployeesForm } from "@/admin/components/EmployeesForm"

import { usePosition } from "@/clinica/hooks/usePosition"
import { useSpecialtiesOption } from "@/clinica/hooks/useSpecialties"
import { useEmployeeDetail } from "../../../clinica/hooks/useEmployeeDetail"
import { useQueryClient } from "@tanstack/react-query"
import { CustomPagination } from "@/components/custom/CustomPagination"






export const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeIdToEdit, setEmployeeIdToEdit] = useState<number | null>(null);


  const { data: positionsData, isLoading: isLoadingPositions } = usePosition();
  const { data: specialtiesData, isLoading: isLoadingSpecialties } = useSpecialtiesOption();
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployes();

  const { employee, isLoading: isLoadingDetail } = useEmployeeDetail(employeeIdToEdit);

  // --- Lógica del Modal ---
  const handleOpenCreate = () => {
    setEmployeeIdToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employeeId: number) => {
    setEmployeeIdToEdit(employeeId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmployeeIdToEdit(null);
    queryClient.resetQueries({ queryKey: ["employeeDetail"] });
  };

  if (isLoadingEmployees || isLoadingPositions || isLoadingSpecialties) {
    return <CustomFullScreenLoading />;
  }

  const filteredEmployees = (employeesData?.employeeListDto || []).filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.fullName.toLowerCase().includes(term) ||
      emp.dni.toLowerCase().includes(term) ||
      (emp.especialtyName && emp.especialtyName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal de la Clínica</CardTitle>
          <CardDescription>Lista de empleados registrados</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empleado
            </Button>
          </div>

          {/* Mostramos el modal cuando está abierto */}
          {isModalOpen && (
            <EmployeesForm
              initialEmployee={employeeIdToEdit ? employee : null}
              positions={positionsData ?? []}
              specialties={specialtiesData ?? []}
              onClose={handleCloseModal}
              isOpen={isModalOpen && !isLoadingDetail} // Espera a que cargue
            />
          )}

          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.fullName}</TableCell>
                  <TableCell>{employee.dni}</TableCell>
                  <TableCell>{employee.especialtyName || "-"}</TableCell>
                  <TableCell>{employee.positionName}</TableCell>
                  <TableCell>{employee.contactPhone}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? "secondary" : "destructive"}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(employee.id)}>
                      {employeeIdToEdit === employee.id ? (<Loader className="h-4 w-4 animate-spin" />) : (<Edit className="h-4 w-4" />)}

                      {/* {isLoadingDetail ? <Loader className="h-4 w-4" /> : <Edit className="h-4 w-4" />} */}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CustomPagination totalPages={employeesData?.pages || 0} />
    </div>
  );
};