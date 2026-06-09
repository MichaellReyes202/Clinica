import { clinicaApi } from "@/api/clinicaApi";
import type { Employee, EmployesFilterResponse, EmployesResponse } from "@/interfaces/Employes.response";
import type { Options } from "@/interfaces/Paginated.response";
import { isAxiosError } from "axios";

export const getEmployeeAction = async (options: Options = {}): Promise<EmployesResponse> => {
  const { limit, offset, query } = options;
  const { data } = await clinicaApi.get<EmployesResponse>("/employees", {
    params: { limit, offset, query },
  });
  return {
    ...data,
  };
};

export const getEmployeeDetail = async (employeeId: number): Promise<Employee> => {
  const { data } = await clinicaApi.get(`/employees/${employeeId}`);
  return {
    ...data,
  };
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

export const createEmployeeAction = async (employee: Partial<Employee> & { photo?: File | null }): Promise<void> => {
  const formData = new FormData();
  Object.entries(employee).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'photo') {
        formData.append(key, value as File);
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  await clinicaApi.post("/employees/createEmployes", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const updateEmployeeAction = async (id: number, employee: Partial<Employee> & { photo?: File | null }) => {
  const formData = new FormData();
  Object.entries(employee).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'photo') {
        formData.append(key, value as File);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  await clinicaApi.put(`/employees/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
