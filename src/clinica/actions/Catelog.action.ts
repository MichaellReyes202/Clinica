import { clinicaApi } from "@/api/clinicaApi";
import type { OptionDto } from "@/interfaces/OptionDto.response";

// Cargar los sexos como una lista de opciones
export const getGenderOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/catalogs/sexCatalog");
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};

// Cargar los tipos de sangre como una lista de opciones
export const getBloodTypeOption = async (): Promise<OptionDto[]> => {
  const { data } = await clinicaApi.get<OptionDto[]>("/catalogs/bloodCatalog");
  return data.map((item: any) => ({
    Id: item.id,
    Name: item.name,
  }));
};
