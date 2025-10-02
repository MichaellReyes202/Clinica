"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Employee {
  id: string
  name: string
  role: string
  specialty?: string
  phone: string
  email: string
  status: "active" | "inactive"
}

export const EmployeesPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees] = useState<Employee[]>([
    {
      id: "1",
      name: "Dr. Juan Pérez",
      role: "Médico",
      specialty: "Medicina General",
      phone: "8888-8888",
      email: "juan@clinic.com",
      status: "active",
    },
    {
      id: "2",
      name: "Dra. María García",
      role: "Médico",
      specialty: "Pediatría",
      phone: "8888-8889",
      email: "maria@clinic.com",
      status: "active",
    },
    {
      id: "3",
      name: "Ana López",
      role: "Recepcionista",
      phone: "8888-8890",
      email: "ana@clinic.com",
      status: "active",
    },
    {
      id: "4",
      name: "Carlos Ruiz",
      role: "Enfermero",
      phone: "8888-8891",
      email: "carlos@clinic.com",
      status: "active",
    },
  ])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Users className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Empleados</h2>
          <p className="text-muted-foreground">Administre el personal de la clínica</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal de la Clínica</CardTitle>
          <CardDescription>Lista de empleados registrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Empleado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                  <DialogDescription>Ingrese los datos del empleado</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input placeholder="Ej: Dr. Juan Pérez" />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input placeholder="Ej: Médico, Enfermero, Recepcionista" />
                  </div>
                  <div>
                    <Label>Especialidad (opcional)</Label>
                    <Input placeholder="Ej: Medicina General" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Teléfono</Label>
                      <Input placeholder="8888-8888" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@clinic.com" />
                    </div>
                  </div>
                  <Button className="w-full">Guardar Empleado</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.specialty || "-"}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "active" ? "secondary" : "destructive"}>
                      {employee.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
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
