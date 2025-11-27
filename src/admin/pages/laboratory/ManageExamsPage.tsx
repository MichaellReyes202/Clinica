import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { FlaskConical, Plus, Edit, Power } from "lucide-react"
import { useExamsBySpecialty, useExamTypeMutation } from "@/clinica/hooks/useExamType"
import { useSpecialtiesOption } from "@/clinica/hooks/useSpecialties"
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CustomPagination } from "@/components/custom/CustomPagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExamTypeSchema, type ExamTypeFormValues } from "@/admin/Validation/ExamTypeSchema"
import type { ExamType } from "@/interfaces/ExamType.response"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Activity, Archive, CheckCircle2 } from "lucide-react"

export const ManageExamsPage = () => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useExamsBySpecialty();
    const { data: specialties, isLoading: loadingSpecialties } = useSpecialtiesOption();

    const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<ExamTypeFormValues>({
        resolver: zodResolver(ExamTypeSchema),
        mode: 'onSubmit',
        defaultValues: {
            name: "",
            description: "",
            deliveryTime: 24,
            pricePaid: 0,
            specialtyId: specialties && specialties.length > 0 ? specialties[0].id : undefined as any,
        }
    });

    const { createMutation, updateMutation, updateStateMutation, isPosting } = useExamTypeMutation(
        () => {
            setShowAddForm(false);
            setEditingId(null);
            reset();
        },
        setError
    );

    const onSubmit = (data: ExamTypeFormValues) => {
        console.log("Datos del formulario:", data);

        // Validar que specialtyId sea un número válido
        if (!data.specialtyId || data.specialtyId < 1 || isNaN(data.specialtyId)) {
            setError("specialtyId", {
                type: "manual",
                message: "Debe seleccionar una especialidad válida"
            });
            return;
        }

        // Transformar a PascalCase para el servidor .NET
        const payload = {
            Name: data.name.trim(),
            Description: data.description && data.description.trim() !== "" ? data.description.trim() : undefined,
            DeliveryTime: Number(data.deliveryTime),
            PricePaid: Number(data.pricePaid),
            SpecialtyId: Number(data.specialtyId),
        };
        console.log("Payload enviado al servidor:", payload);

        if (editingId) {
            const currentExam = exams.flatMap(group => group.examTypes).find(e => e.id === editingId);
            updateMutation.mutate({
                ...payload,
                id: editingId,
                IsActive: currentExam?.isActive ?? true
            } as any);
        } else {
            createMutation.mutate(payload as any);
        }
    };

    if (isLoading || loadingSpecialties) {
        return <CustomFullScreenLoading />
    }

    const exams = data?.items || [];
    const specialtyOptions = specialties || [];

    // Calculate stats
    const allExams = exams.flatMap(group => group.examTypes);
    const totalExams = allExams.length;
    const activeExams = allExams.filter(e => e.isActive).length;
    const inactiveExams = totalExams - activeExams;

    const handleEdit = (exam: ExamType) => {
        setEditingId(exam.id);
        setValue("name", exam.name);
        setValue("description", exam.description || "");
        setValue("deliveryTime", exam.deliveryTime);
        setValue("pricePaid", exam.pricePaid);
        setValue("specialtyId", exam.specialtyId);
        setShowAddForm(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            updateStateMutation.mutate(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">


            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Gestión de Exámenes</h2>
                        <p className="text-muted-foreground">Administre el catálogo de exámenes disponibles</p>
                    </div>
                </div>
                <Button onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditingId(null);
                    reset({
                        name: "",
                        description: "",
                        deliveryTime: 24,
                        pricePaid: 0,
                        specialtyId: specialties && specialties.length > 0 ? specialties[0].id : undefined as any,
                    });
                }} disabled={showAddForm && !editingId} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Examen
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Total Exámenes</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalExams}</div>
                        <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Activos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{activeExams}</div>
                        <p className="text-xs text-muted-foreground">Disponibles para uso</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Inactivos</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{inactiveExams}</div>
                        <p className="text-xs text-muted-foreground">Deshabilitados o archivados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Add Exam Form */}
            {showAddForm && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">{editingId ? "Editar Examen" : "Agregar Nuevo Examen"}</CardTitle>
                        <CardDescription>{editingId ? "Modifique la información del examen" : "Complete la información del nuevo examen"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-card-foreground">
                                        Nombre del Examen *
                                    </Label>
                                    <Input id="name" {...register("name")} placeholder="Ej: Hemograma completo" className="bg-background text-foreground" />
                                    {errors.name && (<p className="text-sm text-red-500">{errors.name.message}</p>)}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialtyId" className="text-card-foreground">
                                        Especialidad *
                                    </Label>
                                    <Select value={watch("specialtyId")?.toString() || ""} onValueChange={(value) => setValue("specialtyId", parseInt(value), { shouldValidate: true })}>
                                        <SelectTrigger className="w-full bg-background text-foreground">
                                            <SelectValue placeholder="Seleccionar especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {specialtyOptions.map((specialty) => (
                                                <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                                    {specialty.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.specialtyId && (
                                        <p className="text-sm text-red-500">{errors.specialtyId.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pricePaid" className="text-card-foreground">
                                        Precio *
                                    </Label>
                                    <Input id="pricePaid" type="number" step="0.01" {...register("pricePaid", { valueAsNumber: true })} placeholder="0.00" className="bg-background text-foreground" />
                                    {errors.pricePaid && (<p className="text-sm text-red-500">{errors.pricePaid.message}</p>)}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deliveryTime" className="text-card-foreground">
                                        Tiempo de Entrega (horas) *
                                    </Label>
                                    <Input id="deliveryTime" type="number" {...register("deliveryTime", { valueAsNumber: true })} placeholder="24" className="bg-background text-foreground" />
                                    {errors.deliveryTime && (<p className="text-sm text-red-500">{errors.deliveryTime.message}</p>)}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description" className="text-card-foreground">
                                        Descripción (Opcional)
                                    </Label>
                                    <Input id="description" {...register("description")} placeholder="Descripción del examen" className="bg-background text-foreground" />
                                    {errors.description && (<p className="text-sm text-red-500">{errors.description.message}</p>)}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => {
                                    setShowAddForm(false);
                                    setEditingId(null);
                                    reset();
                                }}
                                    className="text-card-foreground border-border bg-transparent"
                                    disabled={isPosting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" disabled={isPosting}>
                                    {isPosting ? "Guardando..." : (editingId ? "Actualizar Examen" : "Guardar Examen")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Catálogo de examenes */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Catálogo de Exámenes</CardTitle>
                    <CardDescription>{exams.length} exámenes registrados</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Accordion type="single" className="w-full" defaultValue={exams[0]?.name}>
                            {exams.map((ex) => (
                                <AccordionItem key={ex.name} value={ex.name}>
                                    <AccordionTrigger>{ex.name}</AccordionTrigger>
                                    <AccordionContent className="flex flex-col gap-4 text-balance">
                                        {ex.examTypes.map((exam) => (
                                            <div key={exam.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <FlaskConical className="h-5 w-5 text-chart-1" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <h3 className="font-semibold text-card-foreground">{exam.name}</h3>
                                                                {exam.isActive ?
                                                                    (<Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30"> Activo</Badge>) :
                                                                    (<Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Inactivo</Badge>)
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                                <span>Precio: ${exam.pricePaid}</span>
                                                                <span>Entrega: {exam.deliveryTime}h</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="icon" className="text-card-foreground border-border bg-transparent" title="Editar" onClick={() => handleEdit(exam)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="text-destructive border-border bg-transparent hover:bg-destructive/10" title="Cambiar estado" onClick={() => handleDelete(exam.id)}>
                                                            <Power className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
            <CustomPagination totalPages={data?.pages || 0} />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción cambiará el estado del examen. Si está activo pasará a inactivo y viceversa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive  hover:bg-destructive/90">
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
