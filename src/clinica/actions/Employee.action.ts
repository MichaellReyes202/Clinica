import { clinicaApi } from "@/api/clinicaApi";
import type { Employee, EmployesResponse } from "@/interfaces/Employes.response";

interface Options {
  limit?: number | string;
  offset?: number | string;
  query?: string;
}

// const transformDates = (employe: EmployeeListDto): EmployeeListDto => {
//   employe.hireDate = new Date(employe.hireDate);
//   return employe;
// };

export const getEmployeeAction = async (options: Options = {}): Promise<EmployesResponse> => {
  const { limit, offset, query } = options;
  const { data } = await clinicaApi.get("/employees", {
    params: { limit, offset, query },
  });
  console.log(data);
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

export const createEmployeeAction = async (employee: Partial<Employee>): Promise<void> => {
  try {
    await clinicaApi.post("/employees/createEmployes", employee);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateEmployeeAction = async (id: number, employee: Partial<Employee>) => {
  try {
    await clinicaApi.put(`/employees/${id}`, employee);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
