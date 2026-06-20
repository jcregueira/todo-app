import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { Task, TaskListResponse, TaskCreate, TaskUpdate } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (email: string, password: string) =>
    client.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  logout: () => client.post('/auth/logout'),
};

export const tasksApi = {
  list: (params?: Record<string, string>) =>
    client.get<TaskListResponse>('/api/tasks/', { params }),
  get: (id: number) =>
    client.get<Task>(`/api/tasks/${id}`),
  create: (data: TaskCreate) =>
    client.post<Task>('/api/tasks/', data),
  update: (id: number, data: TaskUpdate) =>
    client.patch<Task>(`/api/tasks/${id}`, data),
  delete: (id: number) =>
    client.delete(`/api/tasks/${id}`),
  overdue: () =>
    client.get<TaskListResponse>('/api/tasks/overdue/list'),
};
