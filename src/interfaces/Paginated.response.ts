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
