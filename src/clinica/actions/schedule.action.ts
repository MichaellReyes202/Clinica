import { clinicaApi } from "@/api/clinicaApi";

export interface ClinicScheduleDto {
  id: number;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;   // "HH:mm"
  closeTime: string;  // "HH:mm"
}

export interface EmployeeScheduleDto {
  id: number;
  employeeId: number;
  dayOfWeek: number;
  dayName: string;
  isAvailable: boolean;
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}

// --- Clínica ---

export const getClinicSchedulesAction = async (): Promise<ClinicScheduleDto[]> => {
  const { data } = await clinicaApi.get<ClinicScheduleDto[]>("/schedules/clinic");
  return data;
};

export const updateClinicScheduleAction = async (id: number, payload: { isOpen: boolean; openTime: string; closeTime: string }): Promise<ClinicScheduleDto> => {
  const { data } = await clinicaApi.put<ClinicScheduleDto>(`/schedules/clinic/${id}`, payload);
  return data;
};

// --- Empleado ---

export const getEmployeeSchedulesAction = async (employeeId: number): Promise<EmployeeScheduleDto[]> => {
  const { data } = await clinicaApi.get<EmployeeScheduleDto[]>(`/schedules/employee/${employeeId}`);
  return data;
};

export const upsertEmployeeScheduleAction = async (
  employeeId: number,
  payload: { dayOfWeek: number; isAvailable: boolean; startTime: string; endTime: string }
): Promise<EmployeeScheduleDto> => {
  const { data } = await clinicaApi.put<EmployeeScheduleDto>(`/schedules/employee/${employeeId}/day`, payload);
  return data;
};

export const updateEmployeeAppointmentDurationAction = async (
  employeeId: number,
  appointmentDurationMinutes: number
): Promise<void> => {
  await clinicaApi.put(`/schedules/employee/${employeeId}/duration`, { appointmentDurationMinutes });
};
