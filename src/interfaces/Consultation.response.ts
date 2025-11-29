export interface StartConsultationDto {
    appointmentId: number;
}

export interface FinishConsultationDto {
    consultationId: number;
    reason?: string;
    physicalExam?: string;
    diagnosis?: string;
    treatmentNotes?: string;
}

export interface ConsultationDetailDto {
    id: number;
    appointmentId: number;
    patientId: number;
    patientName: string;
    doctorId: number;
    doctorName: string;
    reason?: string;
    physicalExam?: string;
    diagnosis?: string;
    treatmentNotes?: string;
    isFinalized: boolean;
    finalizedAt?: string;
    createdAt: string;
    exams: {
        id: number;
        examTypeName: string;
        status: string;
    }[];
    prescriptions: {
        id: number;
        items: {
            medicationName: string;
            dose: string;
            frequency: string;
            duration: string;
        }[];
        notes?: string;
    }[];
}
