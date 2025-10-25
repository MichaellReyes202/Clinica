import { z } from "zod";

export const PositionSchema = z.object({
  id: z.number().optional(),
  name: z.string()
    .min(2, "La especialidad debe tener al menos 5 caracteres")
    .max(50, "El especialidad no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/u, "El nombre de la especialidad debe contener al menos una letra, puede incluir acentos y espacios")
    .refine((val) => {
      const text = val.trim();
      return text.length >= 5;
    })
  ,
  description: z
    .string()
    .nonempty("La descripción es requerida")
    .max(250, "La descripción no puede exceder 250 caracteres"),
  isActive: z.boolean().optional()

});


export type PositionFormValues = z.infer<typeof PositionSchema>;

