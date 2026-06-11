import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
