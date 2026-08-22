import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauth and normalize responses
api.interceptors.response.use(
  (response) => {
    // If backend already wraps with { success: true, data, message }
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('dayflow_token');
        localStorage.removeItem('dayflow_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }
      return Promise.reject(
        error.response.data || {
          success: false,
          message: error.response.data?.message || 'Server returned an error',
        }
      );
    } else if (error.request) {
      // Backend not running or unreachable
      console.warn('Backend at ' + baseURL + ' is unreachable. Using local response handler.');
      return Promise.reject({
        success: false,
        isNetworkError: true,
        message: 'Unable to reach DayFlow backend at ' + baseURL + '. Please ensure server is running on http://localhost:5000.',
      });
    }
    return Promise.reject({
      success: false,
      message: error.message || 'An unexpected error occurred',
    });
  }
);

export default api;
