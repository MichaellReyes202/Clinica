import { clinicaApi } from "@/api/clinicaApi";
import type { Employee, EmployesFilterResponse, EmployesResponse } from "@/interfaces/Employes.response";
import type { Options } from "@/interfaces/Paginated.response";
import { isAxiosError } from "axios";

export const getEmployeeAction = async (options: Options = {}): Promise<EmployesResponse> => {
   try {
      const { limit, offset, query } = options;
      const { data } = await clinicaApi.get<EmployesResponse>("/employees", {
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

export const getEmployeeDetail = async (employeeId: number): Promise<Employee> => {
   try {
      const { data } = await clinicaApi.get(`/employees/${employeeId}`);
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

export const getFilteredEmployees = async (options: Options = {}): Promise<EmployesFilterResponse> => {
   const { limit, offset, query } = options;
   const { data } = await clinicaApi.get<EmployesFilterResponse>("/employees/search", {
      params: { limit, offset, query },
   });
   return {
      ...data,
   };
};

export const createEmployeeAction = async (employee: Partial<Employee>): Promise<void> => {
   await clinicaApi.post("/employees/createEmployes", employee);
};

export const updateEmployeeAction = async (id: number, employee: Partial<Employee>) => {
   await clinicaApi.put(`/employees/${id}`, employee);
};
