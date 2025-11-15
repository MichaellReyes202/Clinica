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
  startTime: string;
  duration: number; // minutos
  reason?: string;
}
export interface AppointmentUpdateDto extends AppointmentCreateDto {
  id: number;
  statusId?: number;
}

export interface AppointmentResponseDto {
  id: number;
  patientId: number;
  patientFullName: string;
  employeeId: number; // id del doctor
  doctorSpecialtyId: number;
  doctorFullName: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason?: string;
  status: string;
  statusId: number;
}

export interface DoctorAvailabilityDto {
  doctorId: number;
  fullName: string;
  specialtyName: string;
  isAvailable: boolean;
  nextAppointmentTime: string | null;
  nextAppointmentDisplay: string;
  availableSlotsToday: number;
  appointmentsTodayCount: number;
}
