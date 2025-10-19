// src/interfaces/BackendError.ts

// Estructura para el error singular (409, 404, 500)
export interface SingularError {
  code: string; // Ej: "Conflict", "NotFound", "Unexpected"
  description: string;
  field?: string; // Opcional: El campo afectado (ej: "email", "dni")
}

// Estructura para errores de validación (400 Bad Request)
export interface ValidationError {
  propertyName: string; // Nombre del campo en el DTO (ej: "firstName")
  errorMessage: string;
}

// Estructura de la respuesta 400 del servidor
export interface ValidationResponse {
  message: string;
  errors: ValidationError[];
}
