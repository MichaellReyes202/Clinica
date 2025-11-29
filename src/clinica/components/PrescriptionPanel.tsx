import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Trash2, Pill, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useMedicationSearch, useConsultationPrescription } from "../hooks/usePrescriptions";
import type { ConsultationFormValues } from "@/admin/Validation/ConsultationSchema";

interface PrescriptionPanelProps {
    consultationId: number;
    form: UseFormReturn<ConsultationFormValues>;
}

export const PrescriptionPanel = ({ consultationId, form }: PrescriptionPanelProps) => {
    const { data: existingPrescription, isLoading: isLoadingExisting } = useConsultationPrescription(consultationId);

    const [searchQuery, setSearchQuery] = useState("");
    const [openSearch, setOpenSearch] = useState(false);
    const { data: medications, isLoading: isLoadingMedications } = useMedicationSearch(searchQuery);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "prescriptionItems"
    });

    const handleAddMedication = (medication: any) => {
        append({
            medicationId: medication.id,
            medicationName: medication.name + (medication.presentation ? ` - ${medication.presentation}` : ""),
            concentration: medication.concentration || "",
            dose: "",
            frequency: "",
            duration: "",
            totalQuantity: 1,
            instructions: ""
        });
        setOpenSearch(false);
        setSearchQuery("");
    };

    if (isLoadingExisting) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    // If prescription already exists, show read-only view
    if (existingPrescription) {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    <span className="font-medium">Receta emitida correctamente</span>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Medicamentos Recetados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicamento</TableHead>
                                    <TableHead>Concentración</TableHead>
                                    <TableHead>Dosis</TableHead>
                                    <TableHead>Frecuencia</TableHead>
                                    <TableHead>Duración</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {existingPrescription.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.medicationName}</TableCell>
                                        <TableCell>{item.concentration || "-"}</TableCell>
                                        <TableCell>{item.dose}</TableCell>
                                        <TableCell>{item.frequency}</TableCell>
                                        <TableCell>{item.duration}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {existingPrescription.notes && (
                            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                                <span className="font-semibold">Notas:</span> {existingPrescription.notes}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => window.print()}>
                        Imprimir Receta
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Nueva Receta</h3>
                    <p className="text-sm text-muted-foreground">
                        Busque y agregue medicamentos a la receta.
                    </p>
                </div>

                <Popover open={openSearch} onOpenChange={setOpenSearch}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
                            <Search className="mr-2 h-4 w-4" />
                            {searchQuery ? searchQuery : "Buscar medicamento..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Escriba nombre o genérico..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList>
                                {isLoadingMedications && <CommandItem disabled>Cargando...</CommandItem>}
                                {!isLoadingMedications && medications?.length === 0 && searchQuery.length > 2 && (
                                    <CommandEmpty>No se encontraron medicamentos.</CommandEmpty>
                                )}
                                <CommandGroup>
                                    {medications?.map((med) => (
                                        <CommandItem
                                            key={med.id}
                                            value={med.name}
                                            onSelect={() => handleAddMedication(med)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{med.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {med.genericName} - {med.concentration} ({med.presentation})
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <Card className="flex-1 border-dashed">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Medicamento</TableHead>
                                <TableHead>Concentración</TableHead>
                                <TableHead>Dosis</TableHead>
                                <TableHead>Frecuencia</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead className="w-[100px]">Cantidad</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No hay medicamentos agregados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="font-medium">
                                            {field.medicationName}
                                            <Input
                                                type="hidden"
                                                {...form.register(`prescriptionItems.${index}.medicationId` as const, { valueAsNumber: true })}
                                            />
                                            <Input
                                                type="hidden"
                                                {...form.register(`prescriptionItems.${index}.medicationName` as const)}
                                            />
                                            <Input
                                                type="hidden"
                                                {...form.register(`prescriptionItems.${index}.concentration` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {field.concentration || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                {...form.register(`prescriptionItems.${index}.dose` as const)}
                                                placeholder="Ej: 500mg"
                                                className="h-8"
                                            />
                                            {form.formState.errors.prescriptionItems?.[index]?.dose && (
                                                <span className="text-[10px] text-red-500">{form.formState.errors.prescriptionItems[index]?.dose?.message}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                {...form.register(`prescriptionItems.${index}.frequency` as const)}
                                                placeholder="Ej: Cada 8 horas"
                                                className="h-8"
                                            />
                                            {form.formState.errors.prescriptionItems?.[index]?.frequency && (
                                                <span className="text-[10px] text-red-500">{form.formState.errors.prescriptionItems[index]?.frequency?.message}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                {...form.register(`prescriptionItems.${index}.duration` as const)}
                                                placeholder="Ej: 5 días"
                                                className="h-8"
                                            />
                                            {form.formState.errors.prescriptionItems?.[index]?.duration && (
                                                <span className="text-[10px] text-red-500">{form.formState.errors.prescriptionItems[index]?.duration?.message}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                {...form.register(`prescriptionItems.${index}.totalQuantity` as const, { valueAsNumber: true })}
                                                className="h-8"
                                            />
                                            {form.formState.errors.prescriptionItems?.[index]?.totalQuantity && (
                                                <span className="text-[10px] text-red-500">{form.formState.errors.prescriptionItems[index]?.totalQuantity?.message}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Label>Notas Adicionales / Indicaciones Generales</Label>
                <Textarea
                    {...form.register("prescriptionNotes")}
                    placeholder="Indicaciones adicionales para el paciente..."
                    className="min-h-[80px]"
                />
            </div>
        </div>
    );
};
