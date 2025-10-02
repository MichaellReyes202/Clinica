"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Search } from "lucide-react"

interface Payment {
  id: string
  patient: string
  amount: number
  method: string
  date: string
  status: "completed" | "pending" | "cancelled"
}

export const RegisterPaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [payments] = useState<Payment[]>([
    { id: "1", patient: "Juan Pérez", amount: 150.0, method: "Efectivo", date: "2025-01-10", status: "completed" },
    { id: "2", patient: "María García", amount: 200.0, method: "Tarjeta", date: "2025-01-10", status: "completed" },
    { id: "3", patient: "Carlos López", amount: 180.0, method: "Transferencia", date: "2025-01-09", status: "pending" },
  ])

  const filteredPayments = payments.filter((payment) =>
    payment.patient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completado</Badge>
      case "pending":
        return <Badge variant="default">Pendiente</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Registrar Pagos</h2>
          <p className="text-muted-foreground">Gestione los pagos de pacientes</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Pago</CardTitle>
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
              <Label>Monto</Label>
              <Input type="number" step="0.01" placeholder="0.00" />
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
            <div>
              <Label>Fecha</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <Button className="w-full">Registrar Pago</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Efectivo:</span>
                <span className="font-bold">$150.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tarjeta:</span>
                <span className="font-bold">$200.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Transferencia:</span>
                <span className="font-bold">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total del Día:</span>
                <span className="font-bold text-lg">$350.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Pagos registrados recientemente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.patient}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
