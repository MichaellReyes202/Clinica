import { useQuery } from "@tanstack/react-query"
import { getPositionOption } from "../actions/Position.action"


export const usePosition = () => {
  return useQuery({
    queryKey: ["position"],
    queryFn: () => getPositionOption(),
    staleTime: 1000 * 60 * 60
  })
}