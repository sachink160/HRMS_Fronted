import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.detail) {
      // Handle different types of error details
      if (Array.isArray(error.response.data.detail)) {
        // Validation errors - extract the first error message
        const firstError = error.response.data.detail[0];
        if (firstError && typeof firstError === 'object' && firstError.msg) {
          toast.error(firstError.msg);
        } else {
          toast.error('Validation error occurred');
        }
      } else if (typeof error.response.data.detail === 'string') {
        // Simple string error
        toast.error(error.response.data.detail);
      } else {
        // Fallback for other error types
        toast.error('An error occurred. Please try again.');
      }
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);