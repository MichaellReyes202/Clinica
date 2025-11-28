import { clinicaApi } from "@/api/clinicaApi";
import type { ConsultationDetailDto, FinishConsultationDto, StartConsultationDto } from "@/interfaces/Consultation.response";

export const startConsultationAction = async (dto: StartConsultationDto): Promise<{ consultationId: number }> => {
    const { data } = await clinicaApi.post<{ consultationId: number }>("/Consultation/start", dto);
    return data;
};

export const finalizeConsultationAction = async (dto: FinishConsultationDto): Promise<void> => {
    await clinicaApi.post("/Consultation/finalize", dto);
};

export const rollbackConsultationAction = async (consultationId: number): Promise<void> => {
    await clinicaApi.post(`/Consultation/rollback/${consultationId}`);
};

export const getConsultationByAppointmentIdAction = async (appointmentId: number): Promise<ConsultationDetailDto> => {
    const { data } = await clinicaApi.get<ConsultationDetailDto>(`/Consultation/by-appointment/${appointmentId}`);
    return data;
};

export const getConsultationsByPatientIdAction = async (patientId: number): Promise<ConsultationDetailDto[]> => {
    const { data } = await clinicaApi.get<ConsultationDetailDto[]>(`/Consultation/by-patient/${patientId}`);
    return data;
};
