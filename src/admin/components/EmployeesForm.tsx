// src/components/employees/EmployeesForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Employee } from "@/interfaces/Employes.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import { EmployeeSchema, type EmployeeFormValues } from "../Validation/EmployeeSchema";
import { useEmployeeMutation } from "@/clinica/hooks/useEmployeeMutation";




interface EmployeesFormProps {
  initialEmployee: Employee | null;
  onClose: () => void;
  positions: OptionDto[];
  specialties: OptionDto[];
  isOpen: boolean;
}

export const EmployeesForm = ({ initialEmployee, onClose, positions, specialties, isOpen }: EmployeesFormProps) => {
  const { handleSubmit, register, setValue, watch, formState: { errors }, reset } = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      age: "",
      positionId: "",
      specialtyId: "",
      contactPhone: "",
      hireDate: new Date().toISOString().substring(0, 10),
      dni: "",
      email: "",
    },
  });

  const isEditing = !!initialEmployee;
  const { updateMutation, createMutation } = useEmployeeMutation(onClose);

  // Resetear formulario al recibir empleado
  useEffect(() => {
    if (initialEmployee) {
      reset({
        firstName: initialEmployee.firstName,
        middleName: initialEmployee.middleName ?? "",
        lastName: initialEmployee.lastName,
        secondLastName: initialEmployee.secondLastName ?? "",
        age: initialEmployee.age.toString(),
        positionId: initialEmployee.positionId.toString(),
        specialtyId: initialEmployee.specialtyId?.toString() ?? "",
        contactPhone: initialEmployee.contactPhone ?? "",
        hireDate: initialEmployee.hireDate.substring(0, 10),
        dni: initialEmployee.dni ?? "",
        email: initialEmployee.email ?? "",
      });
    } else {
      reset();
    }
  }, [initialEmployee, reset]);

  const onSubmit = (values: EmployeeFormValues) => {
    const payload = {
      ...values,
      age: Number(values.age),
      positionId: Number(values.positionId),
      specialtyId: values.specialtyId ? Number(values.specialtyId) : null,
    };

    if (isEditing && initialEmployee) {
      //updateMutation.mutate({ id: initialEmployee.id, data: payload });
    }
    else {
      console.log(JSON.stringify(payload))
      createMutation.mutate(payload);
    }
    console.log(payload); // Para testing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] md:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Primer Nombre *</Label>
              <Input {...register("firstName")} placeholder="Nombre" />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label>Segundo Nombre *</Label>
              <Input {...register("middleName")} placeholder="Segundo Nombre" />
              {errors.middleName && <p className="text-red-500 text-sm">{errors.middleName.message}</p>}
            </div>
            <div>
              <Label>Primer Apellido *</Label>
              <Input {...register("lastName")} placeholder="Apellido" />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label>Segundo Apellido</Label>
              <Input {...register("secondLastName")} placeholder="Segundo Apellido" />
              {errors.secondLastName && <p className="text-red-500 text-sm">{errors.secondLastName.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Puesto *</Label>
              <Select onValueChange={(value) => setValue("positionId", value)} value={watch("positionId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un puesto" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.Id} value={pos.Id.toString()}>
                      {pos.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.positionId && <p className="text-red-500 text-sm">{errors.positionId.message}</p>}
            </div>

            <div>
              <Label>Especialidad</Label>
              <Select onValueChange={(value) => setValue("specialtyId", value)} value={watch("specialtyId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.Id} value={spec.Id.toString()}>
                      {spec.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialtyId && <p className="text-red-500 text-sm">{errors.specialtyId.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Edad *</Label>
              <Input type="text" {...register("age")} placeholder="Edad" />
              {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input type="text" {...register("contactPhone")} placeholder="Teléfono" />
              {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Cedula (EJE : 401-251170-1003A)</Label>
              <Input type="text" {...register("dni")} placeholder="DNI" />
              {errors.dni && <p className="text-red-500 text-sm">{errors.dni.message}</p>}
            </div>
            <div>
              <Label>Fecha de Contratación *</Label>
              <Input type="date" {...register("hireDate")} />
              {errors.hireDate && <p className="text-red-500 text-sm">{errors.hireDate.message}</p>}
            </div>
          </div>

          <div>
            <Label>Correo</Label>
            <Input type="email" {...register("email")} placeholder="Correo electrónico" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};