import { useState, useEffect, type Dispatch, type SetStateAction } from "react"
import { Plus, Search, CheckCircle, Loader, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeesQuery } from "@/clinica/hooks/useEmployes"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import type { UseMutationResult } from "@tanstack/react-query"
import type { CreateUserPayload, UserCreation } from "@/interfaces/Users.response"
import type { AxiosError } from "axios"
import type { OptionDto } from "@/interfaces/OptionDto.response"

interface EmployeeDto {
    id: number;
    fullName: string;
    dni: string;
}


interface Props {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    availableRoles: OptionDto[];
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

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        setUserCreatedData(null);
        setStartCountdown(false);
        setCountdown(5);
        resetForm();
    };

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
            resetForm();
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
                                        <SelectItem key={pos.id} value={pos.id.toString()}>
                                            {pos.name}
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
                    handleCloseSuccess();
                }
                setShowSuccessModal(open);
            }}>
                <DialogContent className="max-w-md p-6 flex flex-col items-center">
                    <DialogHeader className="flex flex-col items-center gap-2">
                        {/* Círculo verde grande estilo SweetAlert */}
                        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50 shadow-xs mb-2">
                            <Check className="h-9 w-9 stroke-[3]" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground text-center">
                            ¡Usuario Creado con Éxito!
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed text-center">
                            El usuario ha sido creado correctamente. Las credenciales de acceso se han enviado a la dirección de correo personal de <strong className="text-foreground">{selectedEmployee?.fullName || "este usuario"}</strong> ({userCreatedData?.email || ""}).
                        </DialogDescription>
                    </DialogHeader>

                    <Button 
                        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                        onClick={handleCloseSuccess}
                    >
                        Aceptar
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
