import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Search, UserPlus, Edit, FileText, User } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { PatientCard } from "@/admin/components/PatientCard"
import { usePatients } from "@/clinica/hooks/usePatient"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useRef, useState } from "react"
import { CustomPagination } from "@/components/custom/CustomPagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"


export const SearchPatients = () => {
   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
   const [searchParams, setSearchParams] = useSearchParams();
   const inputRef = useRef<HTMLInputElement>(null);
   const query = searchParams.get('query') || '';
   const { data: patients, isLoading } = usePatients();
   const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      const query = inputRef.current?.value;

      const newSearchParams = new URLSearchParams();
      if (!query) {
         newSearchParams.delete('query');
      } else {
         newSearchParams.set('query', inputRef.current!.value)
      }
      setSearchParams(newSearchParams);
   }
   if (isLoading) {
      return <CustomFullScreenLoading />
   }

   const calculateAge = (dateOfBirth: string) => {
      return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / 3.15576e+10);
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                  <Search className="h-5 w-5 text-chart-1" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-foreground">Buscar Pacientes</h2>
                  <p className="text-muted-foreground">Busque por nombre completo o parte del mismo</p>
               </div>
            </div>
            <Link to="/dashboard/patients/register/new">
               <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Paciente
               </Button>
            </Link>
         </div>

         {/* Search Bar */}
         <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type="text" ref={inputRef} onKeyDown={handleSearch} defaultValue={query} placeholder="Buscar por nombre del paciente..." className="pl-10 h-12 text-lg bg-card text-card-foreground border-border" />
         </div>

         {/* Results */}
         <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
               <p className="text-sm text-muted-foreground">
                  {patients?.count} {patients?.count === 1 ? "paciente encontrado" : "pacientes encontrados"}
               </p>
               <div className="flex gap-2">
                  <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="gap-2">
                     <LayoutGrid className="h-4 w-4" />
                     Cards
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="gap-2">
                     <List className="h-4 w-4" />
                     Lista
                  </Button>
               </div>

            </div>

            {(patients?.count || 0) > 0 ? (
               viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {
                        patients?.items.map((patient) => (<PatientCard key={patient.id} patient={patient} viewMode={viewMode} />))
                     }
                  </div>
               ) : (
                  // List View as Table
                  <Card className="bg-card border-border">
                     <CardContent className="p-0">
                        <div className="overflow-x-auto">
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Edad</TableHead>
                                    <TableHead>DNI</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {patients?.items.map((patient) => (
                                    <TableRow key={patient.id}>
                                       <TableCell>
                                          <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-sidebar-primary" />
                                             </div>
                                             <span className="font-medium">
                                                {`${patient.firstName} ${patient.lastName}`.trim()}
                                             </span>
                                          </div>
                                       </TableCell>
                                       <TableCell>{calculateAge(patient.dateOfBirth)} años</TableCell>
                                       <TableCell>{patient.dni || "N/D"}</TableCell>
                                       <TableCell>{patient.contactPhone || "N/D"}</TableCell>
                                       <TableCell className="max-w-[200px] truncate" title={patient.contactEmail || ""}>
                                          {patient.contactEmail || "N/D"}
                                       </TableCell>
                                       <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                             <Link to={`/dashboard/patients/edit/${patient.id}`}>
                                                <Button variant="ghost" size="icon" title="Editar" className="h-8 w-8">
                                                   <Edit className="h-4 w-4" />
                                                </Button>
                                             </Link>
                                             <Link to={`/dashboard/consultations/create?patientId=${patient.id}`}>
                                                <Button variant="ghost" size="icon" title="Nueva Consulta" className="h-8 w-8">
                                                   <FileText className="h-4 w-4" />
                                                </Button>
                                             </Link>
                                             <Link to={`/dashboard/patients/${patient.id}/history`}>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                   Historial
                                                </Button>
                                             </Link>
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
               <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">No se encontraron pacientes</h3>
                  <p className="text-muted-foreground">Intente con otro término de búsqueda</p>
               </div>
            )}
            <div className="mt-6 flex justify-center">
               <CustomPagination totalPages={patients?.pages || 0} />
            </div>
         </div>
      </div>
   )
}
