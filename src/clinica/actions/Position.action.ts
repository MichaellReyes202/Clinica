import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

import type { PositionCreation, PositionListDto, PositionUpdate } from "@/interfaces/Positions.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import { isAxiosError } from "axios";

// Traer los cargos como una lista de opciones
export const getPositionOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/position/listOption");
  return data;
};

// Funcio para obtener todos los cargos y mostrarlos en forma de tabla

export const getPositionsAction = async (options: Options = {}): Promise<PaginatedResponseDto<PositionListDto>> => {
  const { limit, offset, query } = options;
  const { data } = await clinicaApi.get<PaginatedResponseDto<PositionListDto>>("/position", {
    params: { limit, offset, query },
  });
  return {
    ...data,
  };
};

// funcion para obtener el detalle de la posicion segun el id

export const getPositionDetail = async (positionId: number): Promise<PositionUpdate> => {
  try {
    const { data } = await clinicaApi.get<PositionUpdate>(`/position/${positionId}`);
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

// crear un nuevo cargo
export const createPositionAction = async (payload: PositionCreation): Promise<void> => {
  await clinicaApi.post<void>("/position/create", payload);
};

// Actualizar un cargo
export const updatePositionAction = async (id: number, payload: PositionUpdate): Promise<void> => {
  await clinicaApi.put(`/position/${id}`, payload);
};
