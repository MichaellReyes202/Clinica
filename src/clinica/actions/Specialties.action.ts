import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import type { Options, PaginatedResponseDto, SpecialtyListDto } from "@/interfaces/Paginated.response";

export const getSpecialtiesOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/specialties/listOption");
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};

export const getSpecialtiesAction = async (options: Options = {}): Promise<PaginatedResponseDto<SpecialtyListDto>> => {
  const { limit, offset, query } = options;
  const { data } = await clinicaApi.get<PaginatedResponseDto<SpecialtyListDto>>("/specialties", {
    params: { limit, offset, query },
  });
  console.log(data);
  return {
    ...data,
  };
};
