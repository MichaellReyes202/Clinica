import { useState } from "react"
import { Search, CheckCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { useDebounce } from "use-debounce"
import { usePatientQuery } from "@/clinica/hooks/usePatient"
import type { PatientFilterResponse } from "@/interfaces/Patient.response"
import type { UseFormSetValue } from "react-hook-form"


interface Props {
  setValue: UseFormSetValue<{
    patientId: string;
    employeeId: string;
    startTime: string;
    duration: string;
    reason?: string | undefined;
  }>
}

export const SearchPatient = ({ setValue }: Props) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 700)
  const [selectedPatient, setSelectedPatient] = useState<PatientFilterResponse | null>(null);

  const { data: availablePatients, isLoading } = usePatientQuery({ query: debouncedQuery });

  const filteredAvailableEmployees = (availablePatients?.items || []);

  // const resetForm = () => {
  //   setSelectedPatient(null);
  //   setQuery("");
  // };

  return (
    <div className="border p-4 rounded-md space-y-3">
      <Label className="text-base font-semibold">Seleccione al Paciente</Label>

      {selectedPatient ? (
        <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md flex justify-between items-center">
          <span className="flex items-center gap-2 font-semibold text-green-800 text-sm">
            <CheckCircle className="h-4 w-4" />
            {selectedPatient.fullName.toUpperCase()}
          </span>
          <Button variant="destructive" size="sm" onClick={() => setSelectedPatient(null)}>
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
                  <div key={emp.id} className="p-2 border-b cursor-pointer hover:bg-accent flex justify-between items-center" onClick={() => {
                    setSelectedPatient(emp)
                    setValue("patientId", emp.id.toString())
                  }}>
                    <span className="font-medium text-gray-700">
                      {emp.fullName.toUpperCase()}
                    </span>
                    <Badge variant="outline">{emp.dni}</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

