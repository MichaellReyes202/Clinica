export interface PaginatedResponseDto<T> {
   count: number;
   pages: number;
   items: T[];
}

export interface Options {
   limit?: number | string;
   offset?: number | string;
   query?: string;
}

// opciones de filtros para el componente de filtros
export interface FilterOptionsGeneric {
   search?: string;
   specialty?: number;  // ID de especialidad
   doctor?: number;     // ID de doctor
   status?: number;     // ID de estado
   dateFrom?: string;
   dateTo?: string;
}