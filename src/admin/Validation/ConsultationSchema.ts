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
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;
