export interface PrescriptionItemDto {
    id?: number;
    medicationId: number;
    medicationName: string;
    concentration?: string;
    dose: string;
    frequency: string;
    duration: string;
    totalQuantity: number;
    instructions?: string;
}

export interface PrescriptionDto {
    id: number;
    consultationId: number;
    status: string;
    notes?: string;
    items: PrescriptionItemDto[];
    createdAt: string;
    doctorName?: string;
}

export interface CreatePrescriptionDto {
    consultationId: number;
    notes?: string;
    items: {
        medicationId: number;
        concentration?: string;
        dose: string;
        frequency: string;
        duration: string;
        totalQuantity: number;
        instructions?: string;
    }[];
}
