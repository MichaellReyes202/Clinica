


// funcion para obtener el audit log

import { clinicaApi } from "@/api/clinicaApi";
import type { AuditLogListDto, AuditLogQuery } from "@/interfaces/AuditLog.response";
import type { PaginatedResponseDto } from "@/interfaces/Paginated.response";

export const getAuditLog = async (params: AuditLogQuery): Promise<PaginatedResponseDto<AuditLogListDto>> => {
   const { data } = await clinicaApi.get<PaginatedResponseDto<AuditLogListDto>>('/audit', { params });
   return data;
};
