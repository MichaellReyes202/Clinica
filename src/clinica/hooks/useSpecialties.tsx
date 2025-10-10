import { useQuery } from "@tanstack/react-query"
import { getSpecialtiesOption } from "../actions/Specialties.action"

export const useSpecialties = () => {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: () => getSpecialtiesOption(),
    staleTime: 1000 * 60 * 60
  })
}
