import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

export const getSpecialtiesOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/specialties/listOption");
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};
