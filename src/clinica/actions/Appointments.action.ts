// Obtener todas las citas

import { clinicaApi } from "@/api/clinicaApi";
import type { AppointmentCreateDto, AppointmentDetailDto, AppointmentResponseDto, AppointmentUpdateDto, DoctorAvailabilityDto, TodayAppointmentDto, UpdateStatusAppointmenDto } from "@/interfaces/Appointment.response";
import type { FilterOptionsGeneric } from "@/interfaces/Paginated.response";

export const getAppointments = async (options: FilterOptionsGeneric): Promise<AppointmentResponseDto[]> => {
    const { data } = await clinicaApi.get<AppointmentResponseDto[]>("/appointment/list", { params: options });
    return data;
};

export const getDoctorAvailability = async (specialtyId: string | null): Promise<DoctorAvailabilityDto[]> => {
    const params = specialtyId && specialtyId !== "all" ? { specialtyId } : {};
    const { data } = await clinicaApi.get<DoctorAvailabilityDto[]>("/appointment/doctorsAvailability", { params });
    return data;
};

export const createAppointmentAction = async (appointment: AppointmentCreateDto): Promise<number> => {
    const { data } = await clinicaApi.post<number>("/appointment/createAppointment", appointment);
    return data;
};

export const updateAppointmentAction = async (id: number, appointment: AppointmentUpdateDto): Promise<void> => {
    await clinicaApi.put(`/appointment/${id}`, appointment);
};

// obtener todas las citas del dia

export const getTodayAppointments = async (date?: Date): Promise<TodayAppointmentDto[]> => {
    const params = date ? { date: date.toISOString() } : {};
    const { data } = await clinicaApi.get<TodayAppointmentDto[]>("/appointment/today", { params });
    return data;
};

// actualizar el estado de la cita
export const updateAppointmentStatusAction = async (appointment: UpdateStatusAppointmenDto): Promise<void> => {
    await clinicaApi.put(`/appointment/updateStatus`, appointment);
};

export const getAppointmentDetailAction = async (id: string): Promise<AppointmentDetailDto> => {
    const { data } = await clinicaApi.get<AppointmentDetailDto>(`/appointment/${id}`);
    return data;
};
