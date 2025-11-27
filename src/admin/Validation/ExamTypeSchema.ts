import { z } from "zod";

export const ExamTypeSchema = z.object({
   name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),

   description: z.string().max(250, "La descripción no puede exceder 250 caracteres").optional().or(z.literal("")),

   deliveryTime: z.number().min(1, "El tiempo de entrega debe ser entre 1 y 240 horas").max(240, "El tiempo de entrega debe ser entre 1 y 240 horas"),

   pricePaid: z.number().min(1, "El precio debe ser entre 1 y 3,000").max(3000, "El precio debe ser entre 1 y 3,000"),

   specialtyId: z.number().min(1, "Debe seleccionar una especialidad"),
});

export type ExamTypeFormValues = z.infer<typeof ExamTypeSchema>;
