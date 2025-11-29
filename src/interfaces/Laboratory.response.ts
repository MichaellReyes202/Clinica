export interface ExamOrderDto {
    appointmentId: number;
    consultationId?: number;
    examTypeIds: number[];
}

export interface ExamProcessDto {
    examId: number;
    results: string;
}

export interface ExamPendingDto {
    id: number;
    examTypeId: number;
    examTypeName: string;
    patientId: number;
    patientName: string;
    statusId: number;
    statusName: string;
    results?: string;
    createdAt: string;
}
