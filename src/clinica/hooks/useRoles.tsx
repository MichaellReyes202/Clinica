
import { useQuery } from "@tanstack/react-query";
import { getRolesAction } from "../actions/Roles.action";


export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => getRolesAction(),
    staleTime: Infinity
  })
}

