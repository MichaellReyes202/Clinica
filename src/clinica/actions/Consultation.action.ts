import { clinicaApi } from "@/api/clinicaApi";
import type { ConsultationDetailDto, FinishConsultationDto, StartConsultationDto } from "@/interfaces/Consultation.response";

export const startConsultationAction = async (dto: StartConsultationDto): Promise<number> => {
  const { data } = await clinicaApi.post<number>("/Consultation/start", dto);
  return data;
};

export interface StartWalkInConsultationRequest {
  patientId: number;
  employeeId: number;
}

export interface StartWalkInConsultationResponse {
  appointmentId: number;
  consultationId: number;
}

export const startWalkInConsultationAction = async (
  dto: StartWalkInConsultationRequest
): Promise<StartWalkInConsultationResponse> => {
  const { data } = await clinicaApi.post<StartWalkInConsultationResponse>("/Consultation/start-walk-in", dto);
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

export const getAllConsultationsAction = async (): Promise<ConsultationDetailDto[]> => {
  const { data } = await clinicaApi.get<ConsultationDetailDto[]>("/Consultation/all");
  return data;
};

export const getConsultationPdfAction = async (id: number): Promise<Blob> => {
  const response = await clinicaApi.get(`/Consultation/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};
