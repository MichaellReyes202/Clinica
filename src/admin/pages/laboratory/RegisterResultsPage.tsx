import { FlaskConical, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getPendingExamsAction } from "@/clinica/actions/Laboratory.action";
import { ProcessExamDialog } from "@/clinica/components/ProcessExamDialog";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const RegisterResultsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: exams = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["pending-exams"],
        queryFn: getPendingExamsAction
    });

    const filteredExams = exams.filter(exam =>
        exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.examTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary border border-sidebar-primary/20">
                        <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Laboratorio</h2>
                        <p className="text-muted-foreground">Gestión de exámenes pendientes</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Exámenes Pendientes</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente o examen..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Examen</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            Cargando...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredExams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No hay exámenes pendientes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExams.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell>
                                                {format(new Date(exam.createdAt), "dd MMM HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">{exam.patientName}</TableCell>
                                            <TableCell>{exam.examTypeName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    {exam.statusName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ProcessExamDialog exam={exam} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
