
import { useQuery } from "@tanstack/react-query";
import { getRolesAction } from "../actions/Roles.action";
import type { OptionDto } from "@/interfaces/OptionDto.response";


export const useRoles = () => {
   return useQuery<OptionDto[]>({
      queryKey: ["roles"],
      queryFn: () => getRolesAction(),
      staleTime: Infinity
   })
}

