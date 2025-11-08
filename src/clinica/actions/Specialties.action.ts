import { clinicaApi } from "@/api/clinicaApi";
import type { DoctorBySpecialtyDto, DoctorBySpecialtyListDto } from "@/interfaces/Appointment.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import type { SpecialtiesCreation, SpecialtiesUpdate, SpecialtyListDto } from "@/interfaces/Specialties.response";
import { isAxiosError } from "axios";

// Obtener la lista de las especialidades en forma de opciones
export const getSpecialtiesOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/specialties/listOption");
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
  }));
};

// Obtener el listados de todas las especialidades para mostrar en la tabla
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

// Obtener los examenes por la especialidad

// Obtener el detalla de la especialidad por el Id
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

// crear una nueva especialidad
export const createSpecialtiesAction = async (payload: SpecialtiesCreation): Promise<void> => {
  await clinicaApi.post<void>("/specialties/create", payload);
};

// Actualizar la especialidad
export const updateSpecialtiesAction = async (id: number, payload: SpecialtiesUpdate): Promise<void> => {
  await clinicaApi.put(`/specialties/${id}`, payload);
};

// funcion para trear todas las especialidades medicas con sus doctores

export const getDoctorBySpecialty = async (): Promise<DoctorBySpecialtyDto[]> => {
  const { data } = await clinicaApi.get<DoctorBySpecialtyDto[]>("specialties/doctorsBySpecialty");
  return data;
};
