"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Download, Printer } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const patientData = [
  { month: "Ene", nuevos: 45, total: 320 },
  { month: "Feb", nuevos: 52, total: 372 },
  { month: "Mar", nuevos: 48, total: 420 },
  { month: "Abr", nuevos: 61, total: 481 },
  { month: "May", nuevos: 55, total: 536 },
  { month: "Jun", nuevos: 67, total: 603 },
]

export default function PatientReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <FileText className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Reportes de Pacientes</h2>
          <p className="text-muted-foreground">Estadísticas y análisis de pacientes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Período</Label>
              <Select defaultValue="6months">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Reporte</Label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="age">Por Edad</SelectItem>
                  <SelectItem value="gender">Por Género</SelectItem>
                  <SelectItem value="specialty">Por Especialidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">603</div>
            <p className="text-xs text-muted-foreground">+67 este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pacientes Nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">55</div>
            <p className="text-xs text-muted-foreground">Pacientes nuevos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crecimiento de Pacientes</CardTitle>
          <CardDescription>Pacientes nuevos y totales por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="nuevos" fill="hsl(var(--chart-1))" name="Nuevos" />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
