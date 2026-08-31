import axios from 'axios';
import { isValidationError, type ErrorBody } from '@/types/api';

// Normalized error thrown by the api client for any failed request so components
// never need to know about Axios/response shapes.
export class ApiError extends Error {
  status: number | null;
  fieldErrors: Record<string, string> | null;

  constructor(message: string, status: number | null, fieldErrors: Record<string, string> | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = error.response?.data as ErrorBody | undefined;

    if (body && isValidationError(body)) {
      const firstMessage = Object.values(body.errors)[0];
      return new ApiError(firstMessage ?? 'Validation failed', status, body.errors);
    }
    if (body && 'error' in body && body.error) {
      return new ApiError(body.error, status);
    }
    if (error.code === 'ERR_NETWORK') {
      return new ApiError('Cannot reach the server. Check your connection and try again.', null);
    }
    if (error.code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', status);
    }
    return new ApiError(error.message || 'Something went wrong', status);
  }
  if (error instanceof Error) {
    return new ApiError(error.message, null);
  }
  return new ApiError('An unexpected error occurred', null);
}
