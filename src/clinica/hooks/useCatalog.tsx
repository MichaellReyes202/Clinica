import { useQuery } from "@tanstack/react-query"
import { getBloodTypeOption, getGenderOption } from "../actions/Catelog.action"
import type { OptionDto } from "@/interfaces/OptionDto.response"

// Obtener todos los sexos (para mostrar como una lista de opciones )
export const useGenderOption = () => {
  return useQuery<OptionDto[]>({
    queryKey: ["genderOption"],
    queryFn: () => getGenderOption(),
    staleTime: Infinity
  })
}

// Obtener todos los tipos de sangre (para mostrar como una lista de opciones )
export const useBloodTypeOption = () => {
  return useQuery<OptionDto[]>({
    queryKey: ["bloodTypeOption"],
    queryFn: () => getBloodTypeOption(),
    staleTime: Infinity
  })
}