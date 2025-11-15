import { useState, type SetStateAction, type Dispatch } from "react"
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
    patientId: string
    employeeId: string
    doctorSpecialtyId: string
    startTime: string
    duration: string
    reason?: string | undefined
  }>
  initialPatient?: PatientFilterResponse | null,
  isPatientSelected: Dispatch<SetStateAction<boolean>>
}

// En SearchPatient - mejorar la función "Cambiar"
export const SearchPatient = ({ setValue, initialPatient, isPatientSelected }: Props) => {
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 700)
  const [selectedPatient, setSelectedPatient] = useState<PatientFilterResponse | null>(() => {
    if (initialPatient) {
      setValue("patientId", initialPatient.id.toString())
      return initialPatient
    }
    return null;
  })

  const { data: availablePatients, isLoading } = usePatientQuery({ query: debouncedQuery })
  const filteredAvailablePatients = availablePatients?.items || []
  const handleClearSelection = () => {
    setSelectedPatient(null)
    setQuery("")
    setValue("patientId", "")
    isPatientSelected(false)
  }

  return (
    <div className="border p-4 rounded-md space-y-3">
      <Label className="text-base font-semibold">Seleccione al Paciente</Label>
      {selectedPatient ? (
        <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md flex justify-between items-center">
          <span className="flex items-center gap-2 font-semibold text-green-800 text-sm">
            <CheckCircle className="h-4 w-4" />
            {selectedPatient.fullName.toUpperCase()}
          </span>
          <Button variant="destructive" size="sm" onClick={handleClearSelection} >
            Cambiar
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por Nombre o DNI del paciente" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>

          {isLoading ?
            (
              <div className="flex justify-center h-40 items-center">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) :
            (
              <div className="h-50 overflow-y-auto border rounded-md">
                {filteredAvailablePatients.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    {query ? "No se encontraron pacientes con ese criterio." : "Ingrese un nombre o DNI para buscar pacientes."}
                  </p>
                ) : (
                  filteredAvailablePatients.slice(0, 10).map((p) => (
                    <div
                      key={p.id}
                      className="p-2 border-b cursor-pointer hover:bg-accent flex justify-between items-center text-xs"
                      onClick={() => {
                        setSelectedPatient(p)
                        isPatientSelected(true)
                        setValue("patientId", p.id.toString())
                      }}
                    >
                      <span className="font-medium text-gray-700">{p.fullName.toUpperCase()}</span>
                      <Badge variant="outline">{p.dni}</Badge>
                    </div>
                  ))
                )}
              </div>
            )
          }
        </>
      )}
    </div>
  )
}




