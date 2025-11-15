// schemas/appointment.schema.ts
import { z } from "zod";

const NOW = new Date(); // Fecha y hora actual del sistema
const TWO_HOURS_FROM_NOW = new Date(NOW.getTime() + 2 * 60 * 60 * 1000);

// === Horarios de atención ===
const isWithinBusinessHours = (date: Date): boolean => {
  const day = date.getDay(); // 0 = domingo
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInHours = hours + minutes / 60;

  if (day === 0) return false; // domingo cerrado
  if (day === 6) return timeInHours >= 8 && timeInHours < 12; // sábado 8:00 - 12:00
  return timeInHours >= 8 && timeInHours < 17; // lunes-viernes 8:00 - 17:00
};

// === Validar que la cita empiece al menos 2 horas después de ahora ===
const isAtLeastTwoHoursFromNow = (start: Date, duration: number): boolean => {
  const end = new Date(start.getTime() + duration * 60000);
  return end >= TWO_HOURS_FROM_NOW;
};

// === Validar que la fecha no sea pasada ===
const isNotInThePast = (date: Date): boolean => {
  return date >= NOW;
};

// === Esquema principal ===
export const AppointmentSchema = z
  .object({
    // ID: Opcional, solo usado en el formulario para indicar que estamos editando.
    id: z.number().optional(),

    patientId: z.string().min(1, "Debe seleccionar un paciente.").regex(/^\d+$/, "El ID del paciente debe ser un número válido."),

    employeeId: z.string().min(1, "Debe seleccionar un médico.").regex(/^\d+$/, "El ID del médico debe ser un número válido."),

    doctorSpecialtyId: z.string(),

    startTime: z
      .string()
      .min(1, "La fecha y hora son obligatorias.")
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Formato inválido. Use AAAA-MM-DDTHH:MM")
      .refine((val) => !isNaN(new Date(val).getTime()), "La fecha y hora deben ser válidas.")
      .refine((val) => isNotInThePast(new Date(val)), {
        message: "No se pueden agendar citas en el pasado.",
      })
      .refine((val) => isWithinBusinessHours(new Date(val)), {
        message: "La hora de inicio debe estar dentro del horario permitido (Lun-Vie 8:00-17:00, Sáb 8:00-12:00).",
      }),

    duration: z
      .string()
      .min(1, "La duración es obligatoria.")
      .regex(/^\d+$/, "La duración debe ser un número.")
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return num >= 5 && num <= 150;
        },
        {
          message: "La duración debe estar entre 5 y 150 minutos.",
        }
      ),

    reason: z.string().max(250, "El motivo no puede exceder los 250 caracteres.").optional(),
    statusId: z.string().optional(),
  })

  // === Validaciones cruzadas ===
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const duration = parseInt(data.duration, 10);
    const end = new Date(start.getTime() + duration * 60000);

    // 1. Validar que la cita termine al menos 2 horas después de ahora
    if (!isAtLeastTwoHoursFromNow(start, duration)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "La cita debe terminar al menos 2 horas después de la hora actual.",
      });
    }

    // 2. Validar que la hora de finalización esté dentro del horario
    if (!isWithinBusinessHours(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "La hora de finalización debe estar dentro del horario permitido.",
      });
    }

    // 3. (Opcional) Validar que no se pase del cierre del día
    const day = start.getDay();
    const endTime = end.getHours() + end.getMinutes() / 60;
    if (day === 6 && endTime >= 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "La cita no puede terminar después de las 12:00 PM los sábados.",
      });
    }
    if (day !== 6 && day !== 0 && endTime >= 17) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "La cita no puede terminar después de las 5:00 PM de lunes a viernes.",
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof AppointmentSchema>;
