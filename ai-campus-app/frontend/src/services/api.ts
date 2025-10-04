import axios from 'axios';

const API_BASE_URL = 'https://ai-campus-shipsy-2.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptors for auth, etc.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
};

export const tasksAPI = {
  getAll: (params?: any) => api.get('/tasks', { params }),
  create: (taskData: any) => api.post('/tasks', taskData),
  update: (id: number, taskData: any) => api.put(`/tasks/${id}`, taskData),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const aiAPI = {
  getAnalysis: () => api.get('/ai/analysis'),
};

export default api;
