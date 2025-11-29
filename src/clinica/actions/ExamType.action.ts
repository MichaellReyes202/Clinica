import { clinicaApi } from "@/api/clinicaApi";
import type { ExamsBySpecialtyListDto, ExamType, ExamTypeCreateDto, ExamTypeListDto } from "@/interfaces/ExamType.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import { isAxiosError } from "axios";

export const getExamTypeAction = async (options: Options = {}): Promise<PaginatedResponseDto<ExamTypeListDto>> => {
    try {
        const { limit, offset, query } = options;
        const { data } = await clinicaApi.get<PaginatedResponseDto<ExamTypeListDto>>("/examType", {
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

export const createExamTypeAction = async (examType: ExamTypeCreateDto): Promise<void> => {
    console.log("Sending to server:", JSON.stringify(examType, null, 2));
    try {
        const response = await clinicaApi.post("/examType/createExamType", examType);
        console.log("Server response:", response.data);
    } catch (error) {
        if (isAxiosError(error)) {
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error headers:", error.response?.headers);
        }
        throw error;
    }
};

export const updateExamTypeAction = async (id: number, examType: Partial<ExamType>): Promise<ExamType> => {
    await clinicaApi.put(`/examType/${id}`, examType);
    return examType as ExamType;
};

export const updateStateExamTypeAction = async (id: number): Promise<void> => {
    await clinicaApi.put(`/examType/${id}/activate`);
};
