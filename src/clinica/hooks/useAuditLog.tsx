import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "../actions/AuditLog.action";
import type { AuditLogListDto, AuditLogQuery } from "@/interfaces/AuditLog.response";
import type { PaginatedResponseDto } from "@/interfaces/Paginated.response";

export const useAuditLog = (params: AuditLogQuery) => {
   const query = useQuery<PaginatedResponseDto<AuditLogListDto>>({
      queryKey: ["audit-log", params],
      queryFn: () => getAuditLog(params),
   });

   return query;
};
