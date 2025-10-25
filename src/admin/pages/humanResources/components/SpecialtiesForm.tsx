import { SpecialtiesSchema, type SpecialtiesFormValues } from "@/admin/Validation/SpecialtiesSchema"
import { useSpecialtiesMutation } from "@/clinica/hooks/useSpecialties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SpecialtiesCreation, SpecialtiesUpdate } from "@/interfaces/Specialties.response";
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label";
import { useEffect } from "react";



interface Props {
  initialSpecialties: SpecialtiesUpdate | null;
  onClose: () => void;
  isOpen: boolean;
}

export const SpecialtiesForm = ({ initialSpecialties, onClose, isOpen }: Props) => {

  const { handleSubmit, register, setValue, watch, formState: { errors }, reset, setError, clearErrors } = useForm<SpecialtiesFormValues>({
    resolver: zodResolver(SpecialtiesSchema),
    defaultValues: {
      id: 0,
      name: "",
      description: "",
      isActive: true
    }
  })
  const isEditing = !!initialSpecialties;

  // const { updateMutation, createMutation, isPosting } = useEmployeeMutation(onClose, setError);
  const { updateMutation, createMutation, isPosting } = useSpecialtiesMutation(onClose, setError);

  // Resetear formulario cuando cambia el empleado
  useEffect(() => {
    if (initialSpecialties) {
      reset({
        id: initialSpecialties.id,
        name: initialSpecialties.name,
        description: initialSpecialties.description ?? "",
        isActive: initialSpecialties.isActive
      });
    } else {
      reset();
    }
  }, [initialSpecialties, reset]);

  const onSubmit = (values: SpecialtiesFormValues) => {
    clearErrors();
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim()
    };
    if (isEditing && initialSpecialties) {
      const updatePayload: SpecialtiesUpdate = { ...payload, id: values.id ?? 0, isActive: values.isActive ?? true };
      updateMutation.mutate(updatePayload);
      console.log(updatePayload)
    } else {
      const createPayload: SpecialtiesCreation = { ...payload };
      console.log(createPayload)
      createMutation.mutate(createPayload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (isPosting) return;
      onClose();
    }}
    >
      <DialogContent onInteractOutside={(e) => { if (isPosting) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Especialidad" : "Nueva Especialidd"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isEditing && (<Input type="hidden" {...register("id")} />)}
          <div className="grid gap-4 ">
            <div>
              <Label>Nombre de la Especialidad</Label>
              <Input {...register("name")} placeholder="Ej: Medicina General" />
              {errors.name && (<p className="text-red-500 text-sm">{errors.name.message}</p>)}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea {...register("description")} placeholder="Breve descripción de la especialidad" />
              {errors.name && (<p className="text-red-500 text-sm">{errors.description?.message}</p>)}
            </div>
          </div>
          <div className="grid gap-4 ">
            {/* Campo visible solo en edición */}
            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <Label>Activo</Label>
                <Switch checked={watch("isActive")} onCheckedChange={(checked) => setValue("isActive", checked)} />
              </div>
            )}

            {isPosting && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-lg">
                <p className="text-lg font-semibold text-blue-600">
                  Guardando, por favor espere...
                </p>
              </div>
            )}
          </div>
          {/* <div className="flex justify-end gap-2 pt-4"> */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose} type="button" disabled={isPosting}> Cancelar </Button>
            <Button type="submit" disabled={isPosting}>
              {isPosting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>


      </DialogContent>
    </Dialog>
  )
}
