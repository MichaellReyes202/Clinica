import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { useDebounce } from "use-debounce"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Plus, Loader, UserRound } from "lucide-react"
import { useEmployes } from "@/clinica/hooks/useEmployes"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { EmployeesForm } from "@/admin/pages/humanResources/components/EmployeesForm"
import { useSpecialtiesOption } from "@/clinica/hooks/useSpecialties"
import { useEmployeeDetail } from "../../../clinica/hooks/useEmployeeDetail"
import { useQueryClient } from "@tanstack/react-query"
import { CustomPagination } from "@/components/custom/CustomPagination"
import { usePositionOption } from "@/clinica/hooks/usePosition"


export const EmployeesPage = () => {
   const queryClient = useQueryClient();
   const [searchParams, setSearchParams] = useSearchParams();
   const queryParam = searchParams.get("query") || "";
   const [searchTerm, setSearchTerm] = useState(queryParam);
   const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [employeeIdToEdit, setEmployeeIdToEdit] = useState<number | null>(null);

   const { data: positionsData, isLoading: isLoadingPositions } = usePositionOption();
   const { data: specialtiesData, isLoading: isLoadingSpecialties } = useSpecialtiesOption();
   const { data: employeesData, isLoading: isLoadingEmployees } = useEmployes();


   const { employee, isLoading: isLoadingDetail } = useEmployeeDetail(employeeIdToEdit);

   // Sync search parameter
   useEffect(() => {
      setSearchTerm(queryParam);
   }, [queryParam]);

   useEffect(() => {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearchTerm) {
         newParams.set("query", debouncedSearchTerm);
         newParams.set("page", "1"); // Reset to first page
      } else {
         newParams.delete("query");
      }
      setSearchParams(newParams);
   }, [debouncedSearchTerm]);

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

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
   };

   if (isLoadingPositions || isLoadingSpecialties) {
      return <CustomFullScreenLoading />;
   }

   const filteredEmployees = employeesData?.employeeListDto || [];


   return (
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
               <UserRound className="h-5 w-5 text-chart-1" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-foreground">Empleados</h2>
               <p className="text-muted-foreground">Gestione de los empleados disponibles en la clínica</p>
            </div>
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Personal de la Clínica</CardTitle>
               <CardDescription>Lista de empleados registrados</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
               <div className="flex gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Buscar empleado por nombre o DNI..." value={searchTerm} onChange={handleSearchChange} className="pl-9" />
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

               {/* Tabla con transiciones de carga */}
               <AnimatePresence mode="wait">
                  {isLoadingEmployees ? (
                     <motion.div
                        key="loading-employees"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center p-12 min-h-[300px] border border-dashed rounded-lg bg-card"
                     >
                        <div className="flex flex-col items-center justify-center gap-3">
                           <Loader className="h-8 w-8 animate-spin text-primary" />
                           <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">Cargando empleados...</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Por favor, espere un momento</p>
                           </div>
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div
                        key="table-employees"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                     >
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>ID</TableHead>
                                 <TableHead>Imagen</TableHead>
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
                              {filteredEmployees.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={10} className="p-12 text-center text-muted-foreground italic">
                                       No se encontraron empleados que coincidan con la búsqueda.
                                    </TableCell>
                                 </TableRow>
                              ) : (
                                 filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                       <TableCell>{employee.id}</TableCell>
                                       <TableCell>
                                          {employee.photoUrl ? (
                                             <img src={employee.photoUrl} alt={employee.fullName} className="w-10 h-10 rounded-full object-cover" />
                                          ) : (
                                             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                <UserRound className="w-6 h-6 text-slate-500" />
                                             </div>
                                          )}
                                       </TableCell>
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
                                          </Button>
                                       </TableCell>
                                    </TableRow>
                                 ))
                              )}
                           </TableBody>
                        </Table>
                     </motion.div>
                  )}
               </AnimatePresence>
            </CardContent>
         </Card>
         <CustomPagination totalPages={employeesData?.pages || 0} />
      </div>
   );
};