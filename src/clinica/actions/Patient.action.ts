import { clinicaApi } from "@/api/clinicaApi";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";
import type { Patient, PatientFilterResponse, PatientListDto } from "@/interfaces/Patient.response";
import { isAxiosError } from "axios";

export const getPatientAction = async (options: Options = {}): Promise<PaginatedResponseDto<PatientListDto>> => {
   try {
      const { limit, offset, query } = options;
      const { data } = await clinicaApi.get<PaginatedResponseDto<PatientListDto>>("/patients", {
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

export const getPatientDetail = async (patientId: string): Promise<Patient> => {
   if (patientId === "new") {
      return {
         id: 0,
         firstName: "",
         middleName: "",
         lastName: "",
         secondLastName: "",
         dateOfBirth: "",
         dni: "",
         contactPhone: "",
         contactEmail: "",
         address: "",
         sexId: "",
         bloodTypeId: "",
         consultationReasons: "",
         chronicDiseases: "",
         allergies: "",
         guardian: {
            fullName: "",
            relationship: "",
            dni: "",
            contactPhone: "",
         },
      };
   }
   if (isNaN(Number(patientId))) {
      throw new Error("Invalid patient ID");
   }
   try {
      const { data } = await clinicaApi.get(`/patients/${patientId}`);
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

export const getFilteredPatient = async (options: Options = {}): Promise<PaginatedResponseDto<PatientFilterResponse>> => {
   const { limit, offset, query } = options;
   const { data } = await clinicaApi.get<PaginatedResponseDto<PatientFilterResponse>>("/patients/search", {
      params: { limit, offset, query },
   });
   return {
      ...data,
   };
};

export const createPatientAction = async (patient: Partial<Patient>): Promise<void> => {
   await clinicaApi.post("/patients/createPatient", patient);
};

export const updatePatientAction = async (id: number, patient: Partial<Patient>): Promise<Patient> => {
   await clinicaApi.put(`/patients/${id}`, patient);
   return patient as Patient;
};
