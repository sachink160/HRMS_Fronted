import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);

  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // HTTP error
  const { status, data } = error.response;
  let message = 'An unexpected error occurred';
  
  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      // Validation errors - extract the first error message
      const firstError = data.detail[0];
      if (firstError && typeof firstError === 'object' && firstError.msg) {
        message = firstError.msg;
      } else {
        message = 'Validation error occurred';
      }
    } else if (typeof data.detail === 'string') {
      message = data.detail;
    }
  } else if (data?.message) {
    message = data.message;
  }

  return {
    message,
    status,
    code: data?.code,
    details: data,
  };
};

export const showErrorToast = (error: ApiError | string) => {
  const message = typeof error === 'string' ? error : error.message;
  toast.error(message);
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showWarningToast = (message: string) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#fbbf24',
      color: '#92400e',
    },
  });
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    const apiError = handleApiError(error);
    showErrorToast(errorMessage || apiError.message);
    return null;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
};

export const formatError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      // Validation errors - extract the first error message
      const firstError = detail[0];
      if (firstError && typeof firstError === 'object' && firstError.msg) {
        return firstError.msg;
      } else {
        return 'Validation error occurred';
      }
    } else if (typeof detail === 'string') {
      return detail;
    }
  }
  return 'An unexpected error occurred';
};
