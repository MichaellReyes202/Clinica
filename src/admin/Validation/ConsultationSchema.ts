import { z } from "zod";

export const consultationSchema = z.object({
    reason: z.string().min(1, "El motivo de consulta es requerido"),
    physicalExam: z.string().optional(),
    diagnosis: z.string().optional(),
    treatmentNotes: z.string().optional(),
    // Vital signs fields (to be concatenated into physicalExam)
    temp: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bp: z.string().optional(),
    hr: z.string().optional(),
    rr: z.string().optional(),
    saturation: z.string().optional(),

    // Prescription Items
    prescriptionItems: z.array(z.object({
        medicationId: z.number(),
        medicationName: z.string(),
        concentration: z.string().optional(), // Added concentration
        dose: z.string().min(1, "Dosis requerida"),
        frequency: z.string().min(1, "Frecuencia requerida"),
        duration: z.string().min(1, "Duración requerida"),
        totalQuantity: z.number().min(1, "Cantidad requerida"),
        instructions: z.string().optional(),
    })).optional(),
    prescriptionNotes: z.string().optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;
