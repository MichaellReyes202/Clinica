import { z } from "zod";

const nicaraguaCedulaRegex = /^[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]$/;

// Subesquema para el tutor
const GuardianSchema = z.object({
  fullName: z
    .string()
    .refine((val) => {
      if (val.length === 0) return true;
      return val.length >= 2 && val.length <= 200 && /^[a-zA-ZÀ-ÿ\s]+$/.test(val);
    }, {
      message: "El nombre completo del tutor debe tener entre 2 y 200 caracteres y solo puede contener letras, incluyendo acentos",
    }),
  dni: z
    .string()
    .refine((val) => {
      if (val.length === 0) return true;
      return nicaraguaCedulaRegex.test(val);
    }, {
      message: "La cédula del tutor debe tener el formato 000-000000-0000A",
    }),
  relationship: z
    .string()
    .refine((val) => {
      if (val.length === 0) return true;
      return val.length >= 2 && val.length <= 100;
    }, {
      message: "El parentesco debe tener entre 2 y 100 caracteres",
    }),
  contactPhone: z
    .string()
    .refine((val) => {
      if (val.length === 0) return true;
      return /^\d{8}$/.test(val);
    }, {
      message: "El teléfono del tutor debe tener exactamente 8 dígitos numéricos",
    }),
}).refine((val) => {
  const { fullName, dni, relationship, contactPhone } = val;
  console.log({ fullName, dni, relationship, contactPhone });
  const allEmpty = [fullName.trim(), dni.trim(), relationship.trim(), contactPhone.trim()].every(f => f.length === 0);
  const allFilled = [fullName.trim(), dni.trim(), relationship.trim(), contactPhone.trim()].every(f => f.length > 0);
  if (allEmpty || allFilled) return true;
  return false;
},
  {
    message: "Por favor complete todos los campos del tutor si llena alguno.",
  }
)


export const PatientSchema = z
  .object({
    id: z.number().optional(),

    firstName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras, incluyendo acentos"),

    middleName: z
      .string()
      .max(100, "El segundo nombre no puede exceder 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "El segundo nombre solo puede contener letras, incluyendo acentos")
      .optional(),

    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(100, "El apellido no puede exceder 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo puede contener letras, incluyendo acentos"),

    secondLastName: z
      .string()
      .max(100, "El segundo apellido no puede exceder 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "El segundo apellido solo puede contener letras, incluyendo acentos")
      .optional(),

    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de nacimiento debe tener el formato AAAA-MM-DD")
      .refine((val) => !isNaN(new Date(val).getTime()), "La fecha de nacimiento debe ser válida"),

    dni: z
      .string()
      .optional()
      .refine((val) => !val || nicaraguaCedulaRegex.test(val), "La cédula debe tener el formato 000-000000-0000A"),

    contactPhone: z
      .string()
      .regex(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos numéricos")
      .optional(),

    contactEmail: z
      .string()
      .email("El correo debe ser válido")
      .max(255, "El correo no puede exceder 255 caracteres")
      .optional(),

    address: z.string().max(500, "La dirección no puede exceder 500 caracteres").optional(),

    sexId: z
      .string()
      .min(1, "El sexo es requerido")
      .regex(/^\d+$/, "El Id del sexo debe ser un número válido"),

    bloodTypeId: z
      .string()
      .regex(/^\d*$/, "El ID del tipo de sangre debe ser un número válido")
      .optional(),

    consultationReasons: z
      .string()
      .max(250, "Los motivos de la consulta no pueden exceder 250 caracteres")
      .optional(),

    chronicDiseases: z
      .string()
      .max(250, "Las enfermedades crónicas no pueden exceder 250 caracteres")
      .optional(),

    allergies: z
      .string()
      .max(250, "Las alergias no pueden exceder 250 caracteres")
      .optional(),

    guardian: GuardianSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const { dni, dateOfBirth } = data;
    if (dni && nicaraguaCedulaRegex.test(dni)) {
      const day = dateOfBirth.substring(8, 10);
      const month = dateOfBirth.substring(5, 7);
      const year = dateOfBirth.substring(2, 4);
      const expected = `${day}${month}${year}`;
      const cedulaPart = dni.substring(4, 10);
      if (cedulaPart !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dni"],
          message: "La cédula no coincide con la fecha de nacimiento (DDMMAA).",
        });
      }
    }
  })
  // Validación condicional: si no hay tutor, el paciente debe ser mayor de edad ( adjunto a la validación del tutor )
  .superRefine((data, ctx) => {
    const { guardian, dateOfBirth } = data;
    const hasGuardian = guardian && Object.values(guardian).some(value => value && value.toString().trim().length > 0);
    if (!hasGuardian) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardian"],
          message: "Si el paciente es menor de edad, debe proporcionar los datos del tutor.",
        });
      }
    }
  })
  // validar que si el paciente en mayor de edad (ingreso la cedula) entonces no debe tener tutor
  .superRefine((data, ctx) => {
    const { guardian, dni, dateOfBirth } = data;
    const hasGuardian = guardian && Object.values(guardian).some(value => value && value.toString().trim().length > 0);
    if (dni && nicaraguaCedulaRegex.test(dni)) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 18 && hasGuardian) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardian"],
          message: "Si el paciente es mayor de edad, no debe proporcionar los datos del tutor.",
        });
      }
    }
  });


export type PatientFormValue = z.infer<typeof PatientSchema>;

//export interface PatientFormData extends PatientFormValue { }

