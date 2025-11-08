" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tag, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Promotion {
  id: string
  name: string
  discount: number
  type: "percentage" | "fixed"
  validUntil: string
  status: "active" | "expired"
}

export const PromotionsPage = () => {
  const [promotions] = useState<Promotion[]>([
    {
      id: "1",
      name: "Descuento Tercera Edad",
      discount: 20,
      type: "percentage",
      validUntil: "2025-12-31",
      status: "active",
    },
    { id: "2", name: "Paquete Familiar", discount: 50, type: "fixed", validUntil: "2025-06-30", status: "active" },
    { id: "3", name: "Promoción Enero", discount: 15, type: "percentage", validUntil: "2025-01-31", status: "active" },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Tag className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Promociones</h2>
          <p className="text-muted-foreground">Administre descuentos y promociones</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Promoción</DialogTitle>
              <DialogDescription>Configure los detalles de la promoción</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre de la Promoción</Label>
                <Input placeholder="Ej: Descuento Tercera Edad" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Descuento</Label>
                  <Input placeholder="Porcentaje / Fijo" />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Válido Hasta</Label>
                <Input type="date" />
              </div>
              <Button className="w-full">Crear Promoción</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promociones Activas</CardTitle>
          <CardDescription>Lista de promociones y descuentos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Válido Hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>{promo.type === "percentage" ? `${promo.discount}%` : `$${promo.discount}`}</TableCell>
                  <TableCell>{promo.type === "percentage" ? "Porcentaje" : "Fijo"}</TableCell>
                  <TableCell>{promo.validUntil}</TableCell>
                  <TableCell>
                    <Badge variant={promo.status === "active" ? "secondary" : "destructive"}>
                      {promo.status === "active" ? "Activa" : "Expirada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
