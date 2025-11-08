import { clinicaApi } from "@/api/clinicaApi";
import type { ExamsBySpecialtyListDto, ExamType } from "@/interfaces/ExamType.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import { isAxiosError } from "axios";

export const getExamTypeAction = async (options: Options = {}): Promise<PaginatedResponseDto<ExamType>> => {
  try {
    const { limit, offset, query } = options;
    const { data } = await clinicaApi.get<PaginatedResponseDto<ExamType>>("/examType", {
      params: { limit, offset, query },
    });
    return {
      ...data,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
    throw error;
  }
};

export const examsBySpecialtyAction = async (options: Options = {}): Promise<PaginatedResponseDto<ExamsBySpecialtyListDto>> => {
  try {
    const { limit, offset, query } = options;
    const { data } = await clinicaApi.get<PaginatedResponseDto<ExamsBySpecialtyListDto>>("/specialties/examsBySpecialty", {
      params: { limit, offset, query },
    });
    return {
      ...data,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
    throw error;
  }
};

export const getExamTypeDetail = async (examTypeId: string): Promise<ExamType> => {
  if (examTypeId === "new") {
    return {
      id: 0,
      name: "",
      description: "",
      deliveryTime: 0,
      isActive: true,
      pricePaid: 0,
      specialtyId: 0,
    };
  }
  if (isNaN(Number(examTypeId))) {
    throw new Error("Invalid patient ID");
  }
  try {
    const { data } = await clinicaApi.get(`/createExamType/${examTypeId}`);
    return {
      ...data,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
    throw error;
  }
};

export const createExamTypeAction = async (examType: Partial<Partial<ExamType>>): Promise<void> => {
  await clinicaApi.post("/createExamType/createExamType", examType);
};

export const updateExamTypeAction = async (id: number, examType: Partial<ExamType>): Promise<ExamType> => {
  await clinicaApi.put(`/createExamType/${id}`, examType);
  return examType as ExamType;
};
