// schemas/appointment.schema.ts
import { z } from "zod";

// === Funciones auxiliares ===
const isTomorrowOrLater = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date >= tomorrow;
};

const isWithinBusinessHours = (date: Date): boolean => {
  const day = date.getDay(); // 0 = domingo
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInHours = hours + minutes / 60;

  if (day === 0) return false; // domingo cerrado
  if (day === 6) return timeInHours >= 8 && timeInHours < 12; // sábado
  return timeInHours >= 8 && timeInHours < 17; // lunes-viernes
};

// === Esquema principal ===
export const AppointmentSchema = z.object({
  patientId: z
    .string()
    .min(1, "Debe seleccionar un paciente.")
    .regex(/^\d+$/, "El ID del paciente debe ser un número válido."),

  employeeId: z
    .string()
    .min(1, "Debe seleccionar un médico.")
    .regex(/^\d+$/, "El ID del médico debe ser un número válido."),

  startTime: z
    .string()
    .min(1, "La fecha y hora son obligatorias.")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Formato inválido. Use AAAA-MM-DDTHH:MM")
    .refine((val) => !isNaN(new Date(val).getTime()), "La fecha y hora deben ser válidas.")
    .refine((val) => isTomorrowOrLater(new Date(val)), {
      message: "La cita solo puede agendarse a partir de mañana.",
    })
    .refine((val) => isWithinBusinessHours(new Date(val)), {
      message: "La hora de inicio debe estar dentro del horario permitido (Lun-Vie 8:00-17:00, Sáb 8:00-12:00).",
    }),

  duration: z
    .string()
    .min(1, "La duración es obligatoria.")
    .regex(/^\d+$/, "La duración debe ser un número.")
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 5 && num <= 150;
    }, {
      message: "La duración debe estar entre 5 y 150 minutos.",
    }),

  reason: z
    .string()
    .max(250, "El motivo no puede exceder los 250 caracteres.")
    .optional(),
})

  // === Validación cruzada: hora de finalización ===
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const duration = parseInt(data.duration, 10);
    const end = new Date(start.getTime() + duration * 60000);

    if (!isWithinBusinessHours(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "La hora de finalización debe estar dentro del horario permitido.",
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof AppointmentSchema>;