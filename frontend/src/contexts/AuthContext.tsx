import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'instructor') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser({ ...decoded.user, name: decoded.name });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token } = res.data;
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    setUser(decoded.user);
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token } = res.data;
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    setUser(decoded.user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};