import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 AuthProvider useEffect - Checking stored auth:', {
      hasToken: !!token,
      hasUserData: !!userData
    });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User restored from localStorage:', parsedUser.username);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    console.log('🔐 Login attempt for user:', username);
    
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      
      console.log('✅ Login successful:', { user: user.username, token: token.substring(0, 20) + '...' });
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('🔄 Auth state updated, user should be redirected to tasks');
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, password: string, email: string) => {
    try {
      await authAPI.register({ username, password, email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
