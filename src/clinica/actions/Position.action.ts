import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

import type { PositionListDto } from "@/interfaces/Positions.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";

// Traer los cargos como una lista de opciones
export const getPositionOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/position/listOption");
  console.log(data);
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
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
