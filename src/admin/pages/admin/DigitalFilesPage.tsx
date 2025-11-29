" "

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Upload, Search, Download, Eye, Trash2 } from "lucide-react"

interface DigitalFile {
    id: string
    name: string
    type: string
    patient: string
    uploadedBy: string
    date: string
    size: string
}

export const DigitalFilesPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [files] = useState<DigitalFile[]>([
        {
            id: "1",
            name: "Radiografía_Torax.pdf",
            type: "Imagen",
            patient: "Juan Pérez",
            uploadedBy: "Dr. García",
            date: "2025-01-10",
            size: "2.4 MB",
        },
        {
            id: "2",
            name: "Resultados_Lab.pdf",
            type: "Laboratorio",
            patient: "María García",
            uploadedBy: "Lab. Técnico",
            date: "2025-01-09",
            size: "1.2 MB",
        },
        {
            id: "3",
            name: "Receta_Medica.pdf",
            type: "Receta",
            patient: "Carlos López",
            uploadedBy: "Dr. Pérez",
            date: "2025-01-08",
            size: "0.5 MB",
        },
    ])

    const filteredFiles = files.filter(
        (file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.patient.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Archivos Digitales</h2>
                    <p className="text-muted-foreground">Gestión de documentos y archivos del sistema</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Archivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{files.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Imágenes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{files.filter((f) => f.type === "Imagen").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Laboratorio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{files.filter((f) => f.type === "Laboratorio").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Recetas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{files.filter((f) => f.type === "Receta").length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Archivos del Sistema</CardTitle>
                    <CardDescription>Documentos y archivos digitales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar archivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Archivo
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Subido Por</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tamaño</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFiles.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{file.type}</TableCell>
                                    <TableCell>{file.patient}</TableCell>
                                    <TableCell>{file.uploadedBy}</TableCell>
                                    <TableCell>{file.date}</TableCell>
                                    <TableCell>{file.size}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
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
