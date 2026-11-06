import { useState, useEffect, type SetStateAction, type Dispatch } from "react"
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
  disabled?: boolean
  presentation?: "default" | "workspace"
}

// En SearchPatient - mejorar la función "Cambiar"
export const SearchPatient = ({ setValue, initialPatient, isPatientSelected, disabled = false, presentation = "default" }: Props) => {
  const isWorkspace = presentation === "workspace";
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 700)
  const [selectedPatient, setSelectedPatient] = useState<PatientFilterResponse | null>(() => {
    if (initialPatient) {
      setValue("patientId", initialPatient.id.toString())
      return initialPatient
    }
    return null;
  })

  // Sincronizar selectedPatient cuando initialPatient cambia (ej. carga asíncrona)
  useEffect(() => {
    if (initialPatient && (!selectedPatient || selectedPatient.id !== initialPatient.id)) {
      setSelectedPatient(initialPatient);
      setValue("patientId", initialPatient.id.toString());
    }
  }, [initialPatient?.id]);

  const { data: availablePatients, isLoading } = usePatientQuery({ query: debouncedQuery })
  const filteredAvailablePatients = availablePatients?.items || []
  const handleClearSelection = () => {
    setSelectedPatient(null)
    setQuery("")
    setValue("patientId", "")
    isPatientSelected(false)
  }

  return (
    <div className={isWorkspace ? "space-y-4" : "space-y-3 rounded-md border p-4"}>
      <Label className={isWorkspace ? "sr-only" : "text-base font-semibold"}>Seleccione al Paciente</Label>
      {selectedPatient ? (
        <div className="flex flex-col gap-3 rounded-lg border border-sidebar-primary/20 bg-sidebar-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-start gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-primary" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{selectedPatient.fullName}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {selectedPatient.dni ? `DNI ${selectedPatient.dni}` : "Paciente seleccionado"}
              </span>
            </span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            disabled={disabled}
            className={`sm:shrink-0 ${isWorkspace ? "text-foreground dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted/50" : ""}`}
          >
            Cambiar
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nombre o DNI del paciente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-10"
              disabled={disabled}
              aria-label="Buscar paciente por nombre o DNI"
            />
          </div>

          {isLoading ?
            (
              <div className="flex justify-center h-40 items-center">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) :
            (
              <div className={isWorkspace ? "max-h-[420px] min-h-[220px] overflow-y-auto rounded-lg border" : "h-50 overflow-y-auto rounded-md border"}>
                {filteredAvailablePatients.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    {query ? "No se encontraron pacientes con ese criterio." : "Ingrese un nombre o DNI para buscar pacientes."}
                  </p>
                ) : (
                  filteredAvailablePatients.slice(0, 10).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={disabled}
                      aria-label={`Seleccionar a ${p.fullName}${p.dni ? `, DNI ${p.dni}` : ""}`}
                      className="flex min-h-14 w-full items-center justify-between gap-4 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => {
                        setSelectedPatient(p)
                        isPatientSelected(true)
                        setValue("patientId", p.id.toString())
                      }}
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">{p.fullName}</span>
                      {p.dni ? <Badge variant="outline" className="shrink-0 font-normal">DNI {p.dni}</Badge> : <span className="shrink-0 text-xs text-muted-foreground">Sin DNI</span>}
                    </button>
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




