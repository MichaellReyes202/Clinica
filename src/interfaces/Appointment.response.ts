import type { OptionDto } from "./OptionDto.response";

export interface Appointment {
  id: number;
  patientId?: number | null;
  employeeId?: number | null;
  startTime: string;
  duration: string; //  "00:30:00"
  endTime?: string | null;
  statusId: number;
  reason?: string | null;

  //exams?: Exam[];
}

export interface DoctorBySpecialtyDto {
  id: number;
  name: string;
  doctors: OptionDto[];
}

export interface DoctorBySpecialtyListDto {
  items: DoctorBySpecialtyDto[];
}

// types/appointment.ts
export interface AppointmentCreateDto {
  patientId: number;
  employeeId: number;
  startTime: string; // ISO string: "2025-11-08T09:30:00-03:00"
  duration: number; // minutos
  reason?: string;
}
