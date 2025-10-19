import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

export const getRolesAction = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/roles/listOption");
  console.log(data);
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};
