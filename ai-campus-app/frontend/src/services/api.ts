import axios from 'axios';
import { Task, TasksResponse, User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: RegisterData): Promise<{ data: { message: string; userId: number } }> =>
    api.post('/auth/register', userData),
  
  login: (credentials: LoginCredentials): Promise<{ data: AuthResponse }> =>
    api.post('/auth/login', credentials),
};

export const tasksAPI = {
  getAll: (params?: any): Promise<{ data: TasksResponse }> => 
    api.get('/tasks', { params }),
  
  getById: (id: number): Promise<{ data: Task }> => 
    api.get(`/tasks/${id}`),
  
  create: (taskData: Partial<Task>): Promise<{ data: Task }> => 
    api.post('/tasks', taskData),
  
  update: (id: number, taskData: Partial<Task>): Promise<{ data: Task }> => 
    api.put(`/tasks/${id}`, taskData),
  
  delete: (id: number): Promise<{ data: { message: string } }> => 
    api.delete(`/tasks/${id}`),
};

// AI API methods
export const aiAPI = {
  getAnalysis: (): Promise<{ data: { analysis: string } }> =>
    api.get('/ai/analysis'),
  
  suggestTitle: (description: string): Promise<{ data: { suggestedTitle: string } }> =>
    api.post('/ai/suggest-title', { description }),
};

// Test function to check connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

export default api;
