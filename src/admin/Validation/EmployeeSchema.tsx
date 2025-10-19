import { z } from "zod";

export const EmployeeSchema = z.object({
  // ID: Opcional, solo usado en el formulario para indicar que estamos editando.
  id: z.number().optional(),

  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ]+$/, "El nombre solo puede contener letras, incluyendo acentos, sin espacios"),
  middleName: z
    .string()
    .max(50, "El segundo nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ]*$/, "El segundo nombre solo puede contener letras, incluyendo acentos, sin espacios")
    .optional(),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ]+$/, "El apellido solo puede contener letras, incluyendo acentos, sin espacios"),
  secondLastName: z
    .string()
    .max(50, "El segundo apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ]*$/, "El segundo apellido solo puede contener letras, incluyendo acentos, sin espacios")
    .optional(),
  age: z
    .string()
    .min(1, "La edad es requerida")
    .regex(/^\d+$/, "La edad debe ser un número entero")
    .refine((val) => {
      const num = Number(val);
      return num >= 18 && num <= 100;
    }, "La edad debe estar entre 18 y 100 años"),
  positionId: z
    .string()
    .min(1, "El puesto es requerido")
    .regex(/^\d+$/, "El ID del puesto debe ser un número válido"),
  specialtyId: z
    .string()
    .regex(/^\d*$/, "El ID de la especialidad debe ser un número válido")
    .optional(),
  contactPhone: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos numéricos")
    .optional(),
  hireDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD")
    .refine((val) => {
      const date = new Date(val);
      return val.trim() !== "" && !isNaN(date.getTime());
    }, {
      message: "La fecha de contratación es requerida y debe ser válida",
    }),
  dni: z
    .string()
    .regex(/^\d{3}-\d{6}-\d{4}[A-Z]$/, "El DNI debe ser un número de hasta 16 dígitos")
    .optional(),
  email: z
    .string()
    .email("El correo debe ser válido")
    .max(100, "El correo no puede exceder 100 caracteres")
    .optional(),
  // Nuevo campo requerido por EmployesUpdateDto
  isActive: z.boolean().optional(),
});


export type EmployeeFormValues = z.infer<typeof EmployeeSchema>;