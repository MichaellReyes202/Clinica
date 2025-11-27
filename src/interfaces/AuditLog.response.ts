

export interface AuditLogListDto {
   id: number;
   userId?: number | null;
   userEmail: string;
   module: AuditModuletype;
   actionType: ActionType;
   createdAtLocal: string;
   status: AuditStatus;
   recordId?: number | null;
   recordDisplay: string;
   changeDetail: string;
}

export const AuditModuletype = {
   Users: 1,
   Patients: 2,
   Appointments: 3,
   System: 4,
   Employees: 5,
   Specialties: 6,
   ExamTypes: 7,
   Positions: 8,
   Roles: 9,
   Auth: 10
} as const;

export type AuditModuletype = typeof AuditModuletype[keyof typeof AuditModuletype];

export const ActionType = {
   AUTH_DENIED: 1,
   LOGIN_SUCCESS: 2,
   LOGIN_FAILURE: 3,
   LOGOUT: 4,
   CREATE: 10,
   UPDATE: 11,
   DELETE: 12,
   STATUS_CHANGE: 20,
   REPORT_GENERATED: 21,
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export const AuditStatus = {
   SUCCESS: 1,
   ERROR: 2,
   WARNING: 3,
   FAILURE: 4,
} as const;

export type AuditStatus = typeof AuditStatus[keyof typeof AuditStatus];

export interface AuditLogQuery {
   statusName?: string | null;
   moduleName?: string | null;
   actionName?: string | null;
   searchTerm?: string | null;
   limit?: number | string;
   offset?: number | string;
}
