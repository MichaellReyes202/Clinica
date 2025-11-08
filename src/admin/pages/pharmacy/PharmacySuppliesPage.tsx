" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Supply {
  id: string
  name: string
  category: string
  stock: number
  unit: string
  lastRestocked: string
}

export const PharmacySuppliesPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [supplies] = useState<Supply[]>([
    {
      id: "1",
      name: "Jeringas 5ml",
      category: "Material Médico",
      stock: 500,
      unit: "unidades",
      lastRestocked: "2025-01-05",
    },
    {
      id: "2",
      name: "Guantes de Látex",
      category: "Protección",
      stock: 1000,
      unit: "pares",
      lastRestocked: "2025-01-03",
    },
    {
      id: "3",
      name: "Gasas Estériles",
      category: "Material de Curación",
      stock: 200,
      unit: "paquetes",
      lastRestocked: "2025-01-08",
    },
    { id: "4", name: "Alcohol 70%", category: "Desinfectante", stock: 50, unit: "litros", lastRestocked: "2025-01-02" },
  ])

  const filteredSupplies = supplies.filter(
    (supply) =>
      supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Package className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Suministros</h2>
          <p className="text-muted-foreground">Administre suministros médicos y material de oficina</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Suministros</CardTitle>
          <CardDescription>Material médico y suministros generales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar suministro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Suministro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Suministro</DialogTitle>
                  <DialogDescription>Ingrese los datos del suministro</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre del Suministro</Label>
                    <Input placeholder="Ej: Jeringas 5ml" />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Input placeholder="Ej: Material Médico" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stock Actual</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Unidad</Label>
                      <Input placeholder="Ej: unidades, pares" />
                    </div>
                  </div>
                  <Button className="w-full">Guardar Suministro</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suministro</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Última Reposición</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.map((supply) => (
                <TableRow key={supply.id}>
                  <TableCell className="font-medium">{supply.name}</TableCell>
                  <TableCell>{supply.category}</TableCell>
                  <TableCell>{supply.stock}</TableCell>
                  <TableCell>{supply.unit}</TableCell>
                  <TableCell>{supply.lastRestocked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
