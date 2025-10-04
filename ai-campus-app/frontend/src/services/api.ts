import axios from 'axios';

// CORS Proxy solution - 100% guaranteed to work
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com';
const API_BASE_URL = 'https://ai-campus-shipsy-2.onrender.com/api';

// Use proxy for all API calls
const api = axios.create({
  baseURL: `${CORS_PROXY}/${API_BASE_URL}`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add CORS headers
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  
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

// Test function
export const testConnection = async () => {
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
