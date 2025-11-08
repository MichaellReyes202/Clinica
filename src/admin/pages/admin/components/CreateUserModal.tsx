import { useState, useEffect, type Dispatch, type SetStateAction } from "react"
import { Plus, Search, CheckCircle, Loader, Eye, EyeOff, Check } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeesQuery } from "@/clinica/hooks/useEmployes"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import type { UseMutationResult } from "@tanstack/react-query"
import type { CreateUserPayload, UserCreation } from "@/interfaces/Users.response"
import type { AxiosError } from "axios"

interface EmployeeDto {
  id: number;
  fullName: string;
  dni: string;
}

interface RoleDto {
  Id: number;
  Name: string;
}

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  availableRoles: RoleDto[];
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

  // Estado del modal de éxito
  const [userCreatedData, setUserCreatedData] = useState<UserCreation | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [startCountdown, setStartCountdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedRoleId(null);
    setQuery("");
  };

  const handleCreateUser = () => {
    if (!selectedEmployee || !selectedRoleId) {
      alert("Error: Por favor, selecciona un empleado y un rol.");
      return;
    }
    const payload = {
      employeeId: selectedEmployee.id,
      roleId: Number(selectedRoleId)
    };
    createMutation.mutate(payload, {
      onSuccess: (data) => {
        setUserCreatedData(data);
        setShowSuccessModal(true);
        toast.success("Usuario creado correctamente!");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (error) => {
        console.log(error)
        const backendMessage = "No se pudo crear el usuario";
        toast.error(backendMessage);
      },
    });
  }

  const filteredAvailableEmployees = (availableEmployees?.employeeListSearchDto || []);
  const isFormComplete = selectedEmployee && selectedRoleId;

  useEffect(() => {
    if (startCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (startCountdown && countdown === 0) {
      setShowSuccessModal(false);
      setUserCreatedData(null);
      setCountdown(5);
      setStartCountdown(false);
    }
  }, [startCountdown, countdown]);

  return (
    <>
      {/* === MODAL PRINCIPAL: Crear usuario === */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (createMutation.isPending) return;
        setIsModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Agregar Usuario
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xl" onInteractOutside={(e) => { if (createMutation.isPending) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Busque un empleado y asígnele un rol para crear su cuenta de sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* === Paso 1: Seleccionar empleado === */}
            <div className="border p-4 rounded-md space-y-3">
              <Label className="text-base font-semibold">1. Seleccionar Empleado</Label>

              {selectedEmployee ? (
                <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md flex justify-between items-center">
                  <span className="flex items-center gap-2 font-semibold text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    {selectedEmployee.fullName} ({selectedEmployee.dni})
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => setSelectedEmployee(null)}>
                    Cambiar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por Nombre o DNI del empleado" value={query} onChange={(e) => { setQuery(e.target.value) }} className="pl-10" />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center h-40 items-center"><Loader className="h-6 w-6 animate-spin" /></div>
                  ) : (
                    <div className="h-40 overflow-y-auto border rounded-md">
                      {filteredAvailableEmployees.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">
                          No se encontraron empleados disponibles o todos ya tienen usuario.
                        </p>
                      ) : (
                        filteredAvailableEmployees.slice(0, 10).map((emp) => (
                          <div key={emp.id} className="p-2 border-b cursor-pointer hover:bg-accent flex justify-between items-center" onClick={() => setSelectedEmployee(emp)}>
                            <span className="font-medium text-gray-700">{emp.fullName}</span><Badge variant="outline">{emp.dni}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* === Paso 2: Asignar Rol === */}
            <div className="border p-4 rounded-md space-y-4">
              <Label className="text-base font-semibold">2. Asignar Rol</Label>
              <Select value={selectedRoleId || ""} onValueChange={setSelectedRoleId} disabled={!selectedEmployee}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  {(availableRoles || []).map((pos) => (
                    <SelectItem key={pos.Id} value={pos.Id.toString()}>
                      {pos.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleCreateUser} disabled={!isFormComplete || createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={(open) => {
        if (!open) {
          setStartCountdown(false);
          setCountdown(5);
        }
        setShowSuccessModal(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><Check /> Usuario Creado Exitosamente</DialogTitle>
            <DialogDescription>Estos son los datos de acceso generados automáticamente:</DialogDescription>
          </DialogHeader>

          {userCreatedData && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Email</Label>
                <Input type="text" value={userCreatedData.email} readOnly />
              </div>
              <div>
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={userCreatedData.password} readOnly className="pr-10" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {startCountdown ? (
                <div className="text-sm text-center text-muted-foreground mt-3">
                  Cerrando en <span className="font-semibold">{countdown}</span> segundos...
                </div>
              ) : (
                <Button className="w-full mt-3" variant="secondary" onClick={() => setStartCountdown(true)}>
                  Cerrar
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
