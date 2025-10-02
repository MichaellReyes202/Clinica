

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Search, Pill } from "lucide-react"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

const availableMedications = [
  "Paracetamol 500mg",
  "Ibuprofeno 400mg",
  "Amoxicilina 500mg",
  "Losartán 50mg",
  "Omeprazol 20mg",
  "Metformina 850mg",
  "Atorvastatina 20mg",
  "Aspirina 100mg",
]

export const PrescriptionGenerator = () => {
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredMedications = availableMedications.filter((med) =>
    med.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addMedication = (medName: string) => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: medName,
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }
    setMedications([...medications, newMed])
    setSearchQuery("")
    setShowSuggestions(false)
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Generador de Recetas</CardTitle>
        <CardDescription>Busque y agregue medicamentos con sus indicaciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Medications */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Buscar Medicamento</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar medicamento..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 bg-background text-foreground"
            />
            {showSuggestions && searchQuery && filteredMedications.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredMedications.map((med, index) => (
                  <button
                    key={index}
                    onClick={() => addMedication(med)}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-popover-foreground"
                  >
                    {med}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medications List */}
        {medications.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Medicamentos Agregados</h3>
            {medications.map((med) => (
              <div key={med.id} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-chart-1" />
                    <h4 className="font-medium text-card-foreground">{med.name}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMedication(med.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor={`dosage-${med.id}`} className="text-xs text-muted-foreground">
                      Dosis
                    </Label>
                    <Input
                      id={`dosage-${med.id}`}
                      placeholder="1 tableta"
                      value={med.dosage}
                      onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`frequency-${med.id}`} className="text-xs text-muted-foreground">
                      Frecuencia
                    </Label>
                    <Input
                      id={`frequency-${med.id}`}
                      placeholder="Cada 8 horas"
                      value={med.frequency}
                      onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`duration-${med.id}`} className="text-xs text-muted-foreground">
                      Duración
                    </Label>
                    <Input
                      id={`duration-${med.id}`}
                      placeholder="7 días"
                      value={med.duration}
                      onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`instructions-${med.id}`} className="text-xs text-muted-foreground">
                    Indicaciones
                  </Label>
                  <Textarea
                    id={`instructions-${med.id}`}
                    placeholder="Tomar con alimentos, evitar alcohol..."
                    value={med.instructions}
                    onChange={(e) => updateMedication(med.id, "instructions", e.target.value)}
                    className="bg-background text-foreground"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {medications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay medicamentos agregados</p>
            <p className="text-sm">Busque y agregue medicamentos usando el campo de búsqueda</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
