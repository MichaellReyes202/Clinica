"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, Plus, Trash2, Printer } from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

export const GenerateInvoicePage = () => {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [newItem, setNewItem] = useState({ description: "", quantity: 1, price: 0 })

  const addItem = () => {
    if (newItem.description && newItem.price > 0) {
      setItems([...items, { ...newItem, id: Date.now().toString() }])
      setNewItem({ description: "", quantity: 1, price: 0 })
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const tax = subtotal * 0.15 // 15% IVA
  const total = subtotal + tax

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Receipt className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Generar Factura</h2>
          <p className="text-muted-foreground">Cree facturas para servicios y productos</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Paciente</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Juan Pérez</SelectItem>
                  <SelectItem value="2">María García</SelectItem>
                  <SelectItem value="3">Carlos López</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label>Método de Pago</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar Servicio/Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Descripción</Label>
              <Input
                placeholder="Ej: Consulta General"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Precio Unitario</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Factura</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA (15%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Factura
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Guardar Borrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
