export interface EmployesResponse {
  count: number;
  pages: number;
  employeeListDto: EmployeeListDto[];
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
}

// export interface EmployeesCreationDto {
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   secondLastName?: string;
//   age: number;
//   positionId: number; // Cargo que ocupa el empleado
//   specialtyId?: number; // Especialidad a la que pertenece el empleado
//   contactPhone?: string;
//   hireDate: Date; // Fecha de contratación
//   dni?: string; // Número de cédula de identidad de Nicaragua
//   email: string; // Correo personal del empleado
//   isActive: true;
// }

// {
//     "id": 3,
//     "firstName": "Michaell",
//     "middleName": "Joel",
//     "lastName": "Reyes",
//     "secondLastName": "Aguilar",
//     "age": 26,
//     "positionId": 2,
//     "specialtyId": 1,
//     "contactPhone": "83718918",
//     "hireDate": "2024-10-07",
//     "dni": "401-101198-1003A",
//     "email": "michaelljoel.reyes202@gmail.com",
//     "isActive": true
// }
