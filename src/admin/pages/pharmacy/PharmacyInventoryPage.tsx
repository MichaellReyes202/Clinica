"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pill, Search, Plus, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Medicine {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  expiryDate: string
}

export const PharmacyInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      name: "Paracetamol 500mg",
      category: "Analgésico",
      stock: 150,
      minStock: 50,
      price: 2.5,
      expiryDate: "2025-12-31",
    },
    {
      id: "2",
      name: "Amoxicilina 500mg",
      category: "Antibiótico",
      stock: 30,
      minStock: 40,
      price: 8.0,
      expiryDate: "2025-06-30",
    },
    {
      id: "3",
      name: "Ibuprofeno 400mg",
      category: "Antiinflamatorio",
      stock: 200,
      minStock: 60,
      price: 3.5,
      expiryDate: "2026-03-15",
    },
    {
      id: "4",
      name: "Omeprazol 20mg",
      category: "Antiácido",
      stock: 80,
      minStock: 30,
      price: 5.0,
      expiryDate: "2025-09-20",
    },
  ])

  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Agotado", variant: "destructive" as const }
    if (stock < minStock) return { label: "Bajo", variant: "default" as const }
    return { label: "Normal", variant: "secondary" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Pill className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Inventario</h2>
          <p className="text-muted-foreground">Administre el inventario de medicamentos y suministros</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Medicamentos</CardTitle>
          <CardDescription>Lista completa de medicamentos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Medicamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
                  <DialogDescription>Ingrese los datos del medicamento</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre del Medicamento</Label>
                    <Input placeholder="Ej: Paracetamol 500mg" />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Input placeholder="Ej: Analgésico" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stock Actual</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Stock Mínimo</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Precio</Label>
                      <Input type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Fecha de Vencimiento</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button className="w-full">Guardar Medicamento</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const status = getStockStatus(medicine.stock, medicine.minStock)
                return (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>{medicine.stock} unidades</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>${medicine.price.toFixed(2)}</TableCell>
                    <TableCell>{medicine.expiryDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
