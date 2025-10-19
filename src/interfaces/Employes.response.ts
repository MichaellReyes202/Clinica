export interface EmployesResponse {
  count: number;
  pages: number;
  employeeListDto: EmployeeListDto[];
}

export interface EmployesFilterResponse {
  count: number;
  pages: number;
  employeeListSearchDto: EmployeeFilterDto[];
}

// interfaz para crear mostrar los empleados en la tabla
export interface EmployeeListDto {
  id: number;
  fullName: string;
  dni: string;
  positionName: string;
  especialtyName: string;
  contactPhone: string;
  email: string;
  isActive: boolean;
  positionId: number;
  specialtyId: number;
}

export interface Employee {
  id?: number; // Opcional para Crear
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  age: number;
  positionId: number;
  specialtyId: number | null;
  contactPhone: string;
  hireDate: string; // Formato YYYY-MM-DD
  dni: string;
  email: string;
  isActive: boolean;
}

export interface EmployeeCreationDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  age: number;
  positionId: number;
  contactPhone?: string;
  hireDate: string;
  dni?: string;
  specialtyId?: number | null;
  email: string;
}

export interface EmployeeUpdateDto extends EmployeeCreationDto {
  id: number;
  isActive: boolean;
}

// interfaz para la busqueda de los empleados

export interface EmployeeFilterDto {
  id: number;
  fullName: string;
  dni: string;
}
