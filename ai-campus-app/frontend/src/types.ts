export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  is_urgent: boolean;
  estimated_hours: number;
  actual_hours: number;
  efficiency_ratio: number;
  due_date?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
