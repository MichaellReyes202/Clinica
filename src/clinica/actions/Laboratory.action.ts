import { clinicaApi } from "@/api/clinicaApi";
import type { ExamOrderDto, ExamPendingDto, ExamProcessDto } from "@/interfaces/Laboratory.response";

export const createExamOrderAction = async (dto: ExamOrderDto): Promise<void> => {
    await clinicaApi.post("/Laboratory/order", dto);
};

export const processExamAction = async (dto: ExamProcessDto): Promise<void> => {
    await clinicaApi.put("/Laboratory/process", dto);
};

export const getPendingExamsAction = async (): Promise<ExamPendingDto[]> => {
    const { data } = await clinicaApi.get<ExamPendingDto[]>("/Laboratory/pending");
    return data;
};

export const getExamsByAppointmentIdAction = async (appointmentId: number): Promise<ExamPendingDto[]> => {
    const { data } = await clinicaApi.get<ExamPendingDto[]>(`/Laboratory/by-appointment/${appointmentId}`);
    return data;
};

export const getExamsByPatientIdAction = async (patientId: number): Promise<ExamPendingDto[]> => {
    const { data } = await clinicaApi.get<ExamPendingDto[]>(`/Laboratory/by-patient/${patientId}`);
    return data;
};
