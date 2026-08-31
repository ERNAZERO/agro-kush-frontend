// Shapes for Spring's Page<T> (org.springframework.data.domain.Page) and the
// error bodies produced by GlobalExceptionHandler.

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sort: Sort;
  pageable: Pageable;
}

// Query params accepted by Spring's Pageable resolver (?page=&size=&sort=field,dir)
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Body shape returned by GlobalExceptionHandler.handleValidation (400)
export interface ValidationErrorBody {
  timestamp: string;
  status: number;
  errors: Record<string, string>;
}

// Body shape returned by the other GlobalExceptionHandler handlers (404/409/401/500)
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
}

export type ErrorBody = ValidationErrorBody | ApiErrorBody;

export function isValidationError(body: unknown): body is ValidationErrorBody {
  return !!body && typeof body === 'object' && 'errors' in body;
}
