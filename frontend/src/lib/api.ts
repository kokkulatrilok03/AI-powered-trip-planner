import axios from 'axios';
import type {
  AuthResponse,
  Trip,
  CreateTripInput,
  Activity,
  User,
  ApiResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; max-age=0';
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  me: () => api.get<ApiResponse<User>>('/auth/me'),
};

export const tripApi = {
  generate: (input: CreateTripInput) =>
    api.post<ApiResponse<Trip>>('/trips/generate', input),

  getAll: () => api.get<ApiResponse<Trip[]>>('/trips'),

  getById: (id: string) => api.get<ApiResponse<Trip>>(`/trips/${id}`),

  update: (id: string, data: Partial<Trip>) =>
    api.put<ApiResponse<Trip>>(`/trips/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/trips/${id}`),

  addActivity: (id: string, day: number, activity: Activity) =>
    api.post<ApiResponse<Trip>>(`/trips/${id}/activities`, { day, activity }),

  editActivity: (id: string, day: number, activityIndex: number, activity: Activity) =>
    api.put<ApiResponse<Trip>>(`/trips/${id}/activities`, { day, activityIndex, activity }),

  removeActivity: (id: string, day: number, activityIndex: number) =>
    api.delete<ApiResponse<Trip>>(`/trips/${id}/activities`, {
      data: { day, activityIndex },
    }),

  togglePackingItem: (id: string, index: number, checked: boolean) =>
    api.patch<ApiResponse<Trip>>(`/trips/${id}/packing`, { index, checked }),

  regenerateDay: (id: string, day: number) =>
    api.post<ApiResponse<Trip>>(`/trips/${id}/regenerate-day`, { day }),
};

export default api;
