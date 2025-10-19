"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stethoscope, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSpecialties } from "@/clinica/hooks/useSpecialties"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"

interface Specialty {
  id: string
  name: string
  description: string
  doctors: number
}

export const SpecialtiesPage = () => {

  const { data, isLoading } = useSpecialties();

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }
  const items = Array.isArray(data?.items) ? data.items : [];

  return (

    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Especialidades Médicas</h2>
          <p className="text-muted-foreground">Gestione las especialidades disponibles en la clínica</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Especialidad
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Especialidad</DialogTitle>
              <DialogDescription>Configure los detalles de la especialidad</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre de la Especialidad</Label>
                <Input placeholder="Ej: Medicina General" />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input placeholder="Breve descripción de la especialidad" />
              </div>
              <Button className="w-full">Guardar Especialidad</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades Disponibles</CardTitle>
          <CardDescription>Lista de especialidades médicas en la clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especialidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Doctores</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items!.map((specialty) => (
                <TableRow key={specialty.id.toString()}>
                  <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell>{specialty.description}</TableCell>
                  <TableCell>{specialty.employees} doctores</TableCell>
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
