import { useQuery } from "@tanstack/react-query"
import { getBloodTypeOption, getGenderOption } from "../actions/Catelog.action"

// Obtener todos los sexos (para mostrar como una lista de opciones )
export const useGenderOption = () => {
  return useQuery({
    queryKey: ["genderOption"],
    queryFn: () => getGenderOption(),
    staleTime: Infinity
  })
}

// Obtener todos los tipos de sangre (para mostrar como una lista de opciones )
export const useBloodTypeOption = () => {
  return useQuery({
    queryKey: ["bloodTypeOption"],
    queryFn: () => getBloodTypeOption(),
    staleTime: Infinity
  })
}