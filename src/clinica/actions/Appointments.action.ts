// Obtener todas las citas

import { clinicaApi } from "@/api/clinicaApi";
import type { AppointmentCreateDto, AppointmentResponseDto, AppointmentUpdateDto, DoctorAvailabilityDto } from "@/interfaces/Appointment.response";

export const getAppointments = async (): Promise<AppointmentResponseDto[]> => {
  const { data } = await clinicaApi.get<AppointmentResponseDto[]>("/appointment/list");
  return data;
};

export const getDoctorAvailability = async (): Promise<DoctorAvailabilityDto[]> => {
  const { data } = await clinicaApi.get<DoctorAvailabilityDto[]>("/appointment/doctorsAvailability");
  return data;
};

export const createAppointmentAction = async (appointment: AppointmentCreateDto): Promise<void> => {
  await clinicaApi.post("/appointment/createAppointment", appointment);
};

export const updateAppointmentAction = async (id: number, appointment: AppointmentUpdateDto): Promise<void> => {
  await clinicaApi.put(`/appointment/${id}`, appointment);
};
