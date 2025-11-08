" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { UserCheck } from "lucide-react"

interface AttendanceRecord {
  id: string
  employee: string
  role: string
  checkIn: string
  checkOut: string
  status: "present" | "late" | "absent"
}

export const AttendancePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [records] = useState<AttendanceRecord[]>([
    {
      id: "1",
      employee: "Dr. Juan Pérez",
      role: "Médico General",
      checkIn: "08:00",
      checkOut: "16:00",
      status: "present",
    },
    { id: "2", employee: "Dra. María García", role: "Pediatra", checkIn: "08:15", checkOut: "16:00", status: "late" },
    { id: "3", employee: "Ana López", role: "Recepcionista", checkIn: "07:55", checkOut: "15:55", status: "present" },
    { id: "4", employee: "Carlos Ruiz", role: "Enfermero", checkIn: "-", checkOut: "-", status: "absent" },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="secondary">Presente</Badge>
      case "late":
        return <Badge variant="default">Tarde</Badge>
      case "absent":
        return <Badge variant="destructive">Ausente</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <UserCheck className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Control de Asistencia</h2>
          <p className="text-muted-foreground">Registro de entrada y salida del personal</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              {records.filter((r) => r.status === "present").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tarde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.filter((r) => r.status === "late").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {records.filter((r) => r.status === "absent").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Registro del Día</CardTitle>
            <CardDescription>Asistencia del personal - {date?.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee}</TableCell>
                    <TableCell>{record.role}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
