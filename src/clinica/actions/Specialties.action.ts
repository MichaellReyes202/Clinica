import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import type { SpecialtiesCreation, SpecialtiesUpdate, SpecialtyListDto } from "@/interfaces/Specialties.response";
import { isAxiosError } from "axios";

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

// funcion para traer el detalle de la especialidad
export const getSpecialtiesDetail = async (specialtiesId: number): Promise<SpecialtiesUpdate> => {
  try {
    const { data } = await clinicaApi.get<SpecialtiesUpdate>(`/specialties/${specialtiesId}`);
    return {
      ...data,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
    throw error;
  }
};

// funcion para crear una nueva especialidad

export const createSpecialtiesAction = async (payload: SpecialtiesCreation): Promise<void> => {
  await clinicaApi.post<void>("/specialties/create", payload);
};

export const updateSpecialtiesAction = async (id: number, payload: SpecialtiesUpdate): Promise<void> => {
  await clinicaApi.put(`/specialties/${id}`, payload);
};
