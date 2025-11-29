import { clinicaApi } from "@/api/clinicaApi";
import type { CreatePrescriptionDto, PrescriptionDto } from "@/interfaces/Prescription.response";

export const createPrescriptionAction = async (dto: CreatePrescriptionDto): Promise<PrescriptionDto> => {
    const { data } = await clinicaApi.post<PrescriptionDto>("/Prescriptions", dto);
    return data;
};

export const getPrescriptionsByPatientIdAction = async (patientId: number): Promise<PrescriptionDto[]> => {
    const { data } = await clinicaApi.get<PrescriptionDto[]>(`/Prescriptions/by-patient/${patientId}`);
    return data;
};

export const getPrescriptionByConsultationIdAction = async (consultationId: number): Promise<PrescriptionDto | null> => {
    try {
        const { data } = await clinicaApi.get<PrescriptionDto>(`/Prescriptions/by-consultation/${consultationId}`);
        return data;
    } catch (error) {
        return null; // Return null if not found or error
    }
};
