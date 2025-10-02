


import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus } from "lucide-react"
import { Link } from "react-router"
import { PatientCard } from "@/admin/components/PatientCard"

// Mock patient data
const mockPatients = [
  {
    id: "1",
    fullName: "María González Pérez",
    age: "45",
    phone: "(505) 8765-4321",
    email: "maria.gonzalez@ejemplo.com",
    address: "Barrio San Miguel, Casa #45, Masaya",
    bloodType: "O+",
    allergies: "Penicilina",
    emergencyContact: "Carlos González",
    emergencyPhone: "(505) 8765-4322",
    lastVisit: "25 Sep 2025",
  },
  {
    id: "2",
    fullName: "Carlos Ruiz Martínez",
    age: "32",
    phone: "(505) 8234-5678",
    email: "carlos.ruiz@ejemplo.com",
    address: "Colonia Los Ángeles, Casa #78, Masaya",
    bloodType: "A+",
    allergies: "",
    emergencyContact: "Ana Ruiz",
    emergencyPhone: "(505) 8234-5679",
    lastVisit: "28 Sep 2025",
  },
  {
    id: "3",
    fullName: "Ana Martínez López",
    age: "28",
    phone: "(505) 8456-7890",
    email: "ana.martinez@ejemplo.com",
    address: "Reparto San Juan, Casa #12, Masaya",
    bloodType: "B+",
    allergies: "Mariscos, aspirina",
    emergencyContact: "José Martínez",
    emergencyPhone: "(505) 8456-7891",
    lastVisit: "29 Sep 2025",
  },
  {
    id: "4",
    fullName: "José López García",
    age: "55",
    phone: "(505) 8567-8901",
    email: "jose.lopez@ejemplo.com",
    address: "Barrio El Calvario, Casa #90, Masaya",
    bloodType: "AB+",
    allergies: "",
    emergencyContact: "Laura López",
    emergencyPhone: "(505) 8567-8902",
    lastVisit: "20 Sep 2025",
  },
  {
    id: "5",
    fullName: "Laura Pérez Ramírez",
    age: "38",
    phone: "(505) 8678-9012",
    email: "laura.perez@ejemplo.com",
    address: "Colonia Santa Rosa, Casa #34, Masaya",
    bloodType: "O-",
    allergies: "Polen, ácaros",
    emergencyContact: "Pedro Pérez",
    emergencyPhone: "(505) 8678-9013",
    lastVisit: "27 Sep 2025",
  },
]


export const SearchPatients = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState(mockPatients)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredPatients(mockPatients)
    } else {
      const filtered = mockPatients.filter((patient) => patient.fullName.toLowerCase().includes(query.toLowerCase()))
      setFilteredPatients(filtered)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Search className="h-5 w-5 text-chart-1" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Buscar Pacientes</h2>
            <p className="text-muted-foreground">Busque por nombre completo o parte del mismo</p>
          </div>
        </div>
        <Link to="/dashboard/patients/register">
          <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre del paciente..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-lg bg-card text-card-foreground border-border"
        />
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredPatients.length} {filteredPatients.length === 1 ? "paciente encontrado" : "pacientes encontrados"}
          </p>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No se encontraron pacientes</h3>
            <p className="text-muted-foreground">Intente con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
