import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

export const getPositionOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/position/listOption");
  console.log(data);
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};
