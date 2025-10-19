import { useState, type Dispatch, type SetStateAction } from "react"
import { Plus, Search, CheckCircle, Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeesQuery } from "@/clinica/hooks/useEmployes"

import { useDebounce } from "use-debounce";
import { toast } from "sonner"
import type { UseMutationResult } from "@tanstack/react-query"
import type { CreateUserPayload, UserCreation } from "@/interfaces/Users.response"
import type { AxiosError } from "axios"


// Interfaces asumidas de los DTOs
interface EmployeeDto {
  id: number;
  fullName: string;
  dni: string;
}

interface RoleDto {
  Id: number;
  Name: string;
}

// Interfaz para el objeto de mutación (asumiendo que viene de tanstack/react-query)
// interface CreateUserMutation {
//   mutate: (payload: any, options: { onSuccess: () => void }) => void;
//   isPending: boolean;
// }

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  availableRoles: RoleDto[];
  // createMutation: CreateUserMutation;
  createMutation: UseMutationResult<UserCreation, AxiosError, CreateUserPayload, unknown>;

}


export function CreateUserModal({ isModalOpen, setIsModalOpen, availableRoles, createMutation }: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);


  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 700)
  const [page,] = useState(0);
  const limit = 10;
  const offset = page * limit;
  const { data: availableEmployees, isLoading } = useEmployeesQuery({ query: debouncedQuery, limit, offset });


  // Función de limpieza del formulario
  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedRoleId(null);
    setQuery("");
  };

  const handleCreateUser = () => {
    if (!selectedEmployee || !selectedRoleId) {
      alert("Error: Por favor, selecciona un empleado, un rol y una contraseña de al menos 6 caracteres.");
      return;
    }
    const payload = {
      employeeId: selectedEmployee.id,
      roleId: Number(selectedRoleId)
    };


    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.info("Usuario creado correctamente!", {
          position: "top-right"
        })
        setIsModalOpen(false);
        resetForm();
      },
      onError: (error) => {
        const backendMessage = error.response?.data?.message || "No se pudo crear el usuario";
        toast.error(backendMessage);
      },
    });
  }

  // Filtramos los empleados por el término de búsqueda
  const filteredAvailableEmployees = (availableEmployees?.employeeListSearchDto || []);
  const isFormComplete = selectedEmployee && selectedRoleId;

  return (
    // Llamamos a resetForm al cerrar el modal para limpiar los estados
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setIsModalOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Busque un empleado y asígnele un rol para crear su cuenta de sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/*  Busqueda y Selección de Empleado  */}
          <div className="border p-4 rounded-md space-y-3">
            <Label className="text-base font-semibold">1. Seleccionar Empleado</Label>

            {selectedEmployee ? (
              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md flex justify-between items-center">
                <span className="flex items-center gap-2 font-semibold text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  **Empleado Seleccionado:** {selectedEmployee.fullName} ({selectedEmployee.dni})
                </span>
                <Button variant="destructive" size="sm" onClick={() => setSelectedEmployee(null)} >
                  Cambiar
                </Button>
              </div>
            ) : (
              // Buscador de empleado
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por Nombre o DNI del empleado" value={query} onChange={(e) => { setQuery(e.target.value) }} className="pl-10" />
                </div>

                {/* Lista de Resultados */}
                {
                  isLoading ? (<div className="flex justify-center h-40 items-center"><Loader className="h-6 w- animate-spin" /></div>)
                    :
                    (
                      <div className="h-40 overflow-y-auto border rounded-md">
                        {filteredAvailableEmployees.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground">
                            No se encontraron empleados disponibles o todos ya tienen usuario.
                          </p>
                        ) : (
                          filteredAvailableEmployees.slice(0, 10).map((emp) => ( // Limitar a 5 resultados
                            <div key={emp.id} className="p-2 border-b cursor-pointer hover:bg-accent flex justify-between items-center" onClick={() => setSelectedEmployee(emp)} >
                              <span className="font-medium text-gray-700">{emp.fullName}</span><Badge variant="outline">{emp.dni}</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    )
                }

              </>
            )}
          </div>

          {/* === PASO 2: Asignación de Rol y Contraseña === */}
          <div className="border p-4 rounded-md space-y-4" >
            <Label className="text-base font-semibold">2. Asignar Rol</Label>
            <div className="w-full">
              {/* <Label htmlFor="role">Rol</Label> */}
              <Select value={selectedRoleId || ""} onValueChange={setSelectedRoleId} disabled={!selectedEmployee}  >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent >
                  {(availableRoles || []).map((pos) => (
                    <SelectItem key={pos.Id} value={pos.Id.toString()}>
                      {pos.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* password */}


          </div>

          <Button
            className="w-full"
            onClick={handleCreateUser}
            disabled={!isFormComplete || createMutation.isPending}
          >
            {createMutation.isPending ? "Creando..." : "Crear Usuario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


{/* <div>
              <Label htmlFor="password">Contraseña Temporal</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                disabled={!selectedEmployee}
                className={tempPassword.length > 0 && !isPasswordValid ? 'border-red-500' : ''}
              />
              {tempPassword.length > 0 && !isPasswordValid && (
                <p className="text-red-500 text-xs mt-1">La contraseña debe tener al menos 6 caracteres.</p>
              )}
            </div> */}