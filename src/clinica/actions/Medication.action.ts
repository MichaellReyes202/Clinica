import { clinicaApi } from "@/api/clinicaApi";
import type { MedicationDto } from "@/interfaces/Medication.response";

export const searchMedicationsAction = async (query: string): Promise<MedicationDto[]> => {
    const { data } = await clinicaApi.get<MedicationDto[]>(`/Medications/search?query=${query}`);
    return data;
};
