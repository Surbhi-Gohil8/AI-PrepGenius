import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // FormData must let the browser set Content-Type with the multipart boundary.
    // Directly delete from the AxiosHeaders instance (Axios v1.x) so the
    // default 'application/json' header is not forwarded to the server.
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
