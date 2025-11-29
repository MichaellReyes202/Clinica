export interface User {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    roleId: number;
    employeeId?: number;
}

// intefaz que retona el backend cuando se crea un usuario

export interface UserCreation {
    email: string;
    password: string;
}

// Interfaz para los empleados que NO tienen cuenta de usuario (para la búsqueda)
export interface EmployeeDto {
    id: number;
    fullName: string;
    dni: string;
}

// Interfaz para los roles que se cargan en el dropdown
export interface RoleDto {
    id: number;
    name: string;
    description: string;
}

// Payload que se envía al backend para crear el usuario
export interface CreateUserPayload {
    employeeId: number;
    roleId: number;
}

// interfaz para crear mostrar los usuarios en la tabla

export interface UserResponse {
    count: number;
    pages: number;
    userListDto: UserListDto[];
}
export interface UserListDto {
    id: number;
    employerId?: number | null;
    email: string;
    isActive: boolean;
    fullName: string;
    dni?: string | null;
    lastLogin: string;
    createdAt: string;
    roles: string;
}
