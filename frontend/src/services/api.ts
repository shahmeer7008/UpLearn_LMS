import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const errorData = error.response?.data as any;
    
    // Handle different error scenarios
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;
        
      case 403:
        // Forbidden - access denied
        if (error.config?.url?.includes('/instructor/')) {
          toast.error('Access denied. Please ensure you have instructor privileges.');
        } else {
          toast.error('Access denied. You do not have permission for this action.');
        }
        break;
        
      case 404:
        toast.error('Resource not found.');
        break;
        
      case 422:
        // Validation errors
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: any) => {
            toast.error(err.msg || err.message || 'Validation error');
          });
        } else {
          toast.error(errorData?.message || 'Validation failed');
        }
        break;
        
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
        
      case 500:
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        // Handle network errors
        if (error.code === 'NETWORK_ERROR') {
          toast.error('Network error. Please check your connection.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        } else {
          // Generic error message
          const message = 
            errorData?.message || 
            errorData?.msg || 
            error.message || 
            'An unexpected error occurred';
          toast.error(message);
        }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Helper function to get user ID from token
export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.id || payload.user?._id || payload.id || payload._id || null;
  } catch {
    return null;
  }
};

// Helper function to get user role from token
export const getUserRoleFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.role || payload.role || null;
  } catch {
    return null;
  }
};

export default api;