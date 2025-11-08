" "

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Lock, Printer, Download } from "lucide-react"

export const CashClosurePage = () => {
  const cashData = {
    openingBalance: 500.0,
    totalCash: 650.0,
    totalCard: 800.0,
    totalTransfer: 350.0,
    totalIncome: 1800.0,
    expenses: 150.0,
    expectedBalance: 2150.0,
    actualBalance: 2150.0,
  }

  const transactions = [
    { id: "1", type: "Consulta", patient: "Juan Pérez", amount: 150.0, method: "Efectivo" },
    { id: "2", type: "Examen", patient: "María García", amount: 200.0, method: "Tarjeta" },
    { id: "3", type: "Medicamento", patient: "Carlos López", amount: 50.0, method: "Efectivo" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Lock className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cierre de Caja</h2>
          <p className="text-muted-foreground">Resumen y cierre del día</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cashData.totalCash.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cashData.totalCard.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cashData.totalTransfer.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">${cashData.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones del Día</CardTitle>
          <CardDescription>Detalle de todas las transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.patient}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Cierre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Saldo Inicial:</span>
              <span>${cashData.openingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Ingresos:</span>
              <span className="text-chart-1">${cashData.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos:</span>
              <span className="text-destructive">-${cashData.expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Saldo Final:</span>
              <span>${cashData.expectedBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1">
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
