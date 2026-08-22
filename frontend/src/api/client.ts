import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
<<<<<<< HEAD
  timeout: 15000,
});

// Request interceptor for attaching Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
=======
  timeout: 10000,
});

// Request interceptor for attaching auth headers or logger in future
apiClient.interceptors.request.use(
  (config) => {
>>>>>>> origin/main
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// Response interceptor for session expiration and 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If unauthorized and not already on the login page, redirect
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
=======
// Response interceptor for generic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
>>>>>>> origin/main
    return Promise.reject(error);
  }
);

export default apiClient;
