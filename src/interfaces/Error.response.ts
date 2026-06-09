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

// estructura que viene de tu C#
export interface ApiErrorResponse {
  code: string;
  description: string;
  field: string | null;
  metadata: Record<string, any> | null;
  validationErrors:
    | {
        propertyName: string;
        errorMessage: string;
      }[]
    | null;
}

// Clase personalizada para lanzar desde Axios
export class BackendError extends Error {
  public code: string;
  public status: number;
  public field: string | null;
  public metadata: Record<string, any> | null;
  public validationErrors: ApiErrorResponse["validationErrors"];

  constructor(errorData: ApiErrorResponse, status: number) {
    super(errorData.description); // description será el error.message generico
    this.name = "BackendError";
    this.code = errorData.code;
    this.status = status;
    this.field = errorData.field;
    this.metadata = errorData.metadata;
    this.validationErrors = errorData.validationErrors;
  }
}

export const ErrorCodes = {
  // 400
  BadRequest: "BadRequest",
  ValidationError: "ValidationError",
  MissingRequiredField: "MissingRequiredField",
  InvalidFormat: "InvalidFormat",

  // 401
  Unauthorized: "Unauthorized",
  InvalidCredentials: "InvalidCredentials",
  TokenExpired: "TokenExpired",
  InvalidToken: "InvalidToken",

  // 403
  Forbidden: "Forbidden",
  InsufficientPermissions: "InsufficientPermissions",

  // 404
  NotFound: "NotFound",
  ResourceNotFound: "ResourceNotFound",

  // 405
  MethodNotAllowed: "MethodNotAllowed",

  // 409
  Conflict: "Conflict",
  DuplicateResource: "DuplicateResource",
  ResourceAlreadyExists: "ResourceAlreadyExists",

  // 422
  UnprocessableEntity: "UnprocessableEntity",
  BusinessRuleViolation: "BusinessRuleViolation",

  // 429
  TooManyRequests: "TooManyRequests",
  RateLimitExceeded: "RateLimitExceeded",

  // 500
  Unexpected: "Unexpected",
  InternalServerError: "InternalServerError",
  DatabaseError: "DatabaseError",
  ExternalServiceError: "ExternalServiceError",

  // 503
  ServiceUnavailable: "ServiceUnavailable",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
