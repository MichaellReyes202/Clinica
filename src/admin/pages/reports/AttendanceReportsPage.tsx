"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, Download, Printer } from "lucide-react"

interface AttendanceSummary {
  employee: string
  role: string
  present: number
  late: number
  absent: number
  percentage: number
}

export const AttendanceReportsPage = () => {
  const attendanceData: AttendanceSummary[] = [
    { employee: "Dr. Juan Pérez", role: "Médico General", present: 22, late: 2, absent: 0, percentage: 100 },
    { employee: "Dra. María García", role: "Pediatra", present: 20, late: 3, absent: 1, percentage: 95.8 },
    { employee: "Ana López", role: "Recepcionista", present: 23, late: 1, absent: 0, percentage: 100 },
    { employee: "Carlos Ruiz", role: "Enfermero", present: 21, late: 1, absent: 2, percentage: 91.7 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <UserCheck className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Reportes de Asistencia</h2>
          <p className="text-muted-foreground">Análisis de asistencia del personal</p>
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
              <Select defaultValue="1month">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1week">Última semana</SelectItem>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Departamento</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="medical">Médicos</SelectItem>
                  <SelectItem value="nursing">Enfermería</SelectItem>
                  <SelectItem value="admin">Administrativo</SelectItem>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">96.9%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Llegadas Tarde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ausencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen por Empleado</CardTitle>
          <CardDescription>Asistencia del último mes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Presente</TableHead>
                <TableHead>Tarde</TableHead>
                <TableHead>Ausente</TableHead>
                <TableHead>% Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{record.employee}</TableCell>
                  <TableCell>{record.role}</TableCell>
                  <TableCell>{record.present}</TableCell>
                  <TableCell>{record.late}</TableCell>
                  <TableCell>{record.absent}</TableCell>
                  <TableCell>
                    <span className={record.percentage >= 95 ? "text-chart-1 font-bold" : ""}>
                      {record.percentage}%
                    </span>
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
