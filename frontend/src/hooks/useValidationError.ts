import { useState } from 'react';
import { isAxiosError } from 'axios';

interface ValidationIssue {
  path: string;
  message: string;
}

interface ValidationErrorResponse {
  errors?: ValidationIssue[];
  message?: string;
}

/**
 * Hook to handle validation error responses from the backend.
 * Expected error payload shape:
 * {
 *   success: false,
 *   errors: [{ path: string; message: string }];
 * }
 */
export const useValidationError = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parseError = (error: unknown): Record<string, string> => {
    // Reset errors first
    setFieldErrors({});
    const data = isAxiosError<ValidationErrorResponse>(error) ? error.response?.data : undefined;

    if (data?.errors && Array.isArray(data.errors)) {
      const map: Record<string, string> = {};
      for (const err of data.errors) {
        if (err.path && err.message) {
          map[err.path] = err.message;
        }
      }
      setFieldErrors(map);
      return map;
    }
    // Fallback generic error handling
    const globalMsg = data?.message || (error instanceof Error ? error.message : 'An unexpected error occurred.');
    setFieldErrors({ _global: globalMsg });
    return { _global: globalMsg };
  };

  const clearErrors = () => setFieldErrors({});

  return { fieldErrors, parseError, clearErrors };
};
