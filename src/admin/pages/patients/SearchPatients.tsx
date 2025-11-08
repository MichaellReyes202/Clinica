
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Grid, List, Search, UserPlus } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { PatientCard } from "@/admin/components/PatientCard"
import { usePatients } from "@/clinica/hooks/usePatient"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { useRef, useState } from "react"
import { CustomPagination } from "@/components/custom/CustomPagination"


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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {patients?.count} {patients?.count === 1 ? "paciente encontrado" : "pacientes encontrados"}
          </p>
          <div className="hidden md:flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} className="rounded-r-none" onClick={() => setViewMode('grid')}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} className="rounded-l-none" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>

        </div>

        {(patients?.count || 0) > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6' : 'flex flex-col gap-2'}>
            {
              patients?.items.map((patient) => (
                <PatientCard key={patient.id} patient={patient} viewMode={viewMode} />
              ))
            }
          </div>
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
