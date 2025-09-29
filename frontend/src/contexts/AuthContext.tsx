import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        console.log('Decoded token:', decoded);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired, removing...');
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }
        
        // Handle different token structures
        const userData = decoded.user || decoded;
        
        // Ensure we have a consistent user object with _id
        const normalizedUser = {
          _id: userData.id || userData._id || userData.userId,
          id: userData.id || userData._id || userData.userId,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student',
          status: userData.status || 'approved',
          createdDate: userData.createdDate || new Date().toISOString(),
          lastModifiedDate: userData.lastModifiedDate || new Date().toISOString()
        };
        
        console.log('Normalized user:', normalizedUser);
        
        // Only set user if we have a valid ID
        if (normalizedUser._id) {
          setUser(normalizedUser);
          setToken(storedToken);
          
          // Update axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          api.defaults.headers.common['x-auth-token'] = storedToken;
        } else {
          console.error('No valid user ID found in token');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken } = res.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Update axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      const decoded: any = jwtDecode(newToken);
      console.log('Login - Decoded token:', decoded);
      
      const userData = decoded.user || decoded;
      
      const normalizedUser = {
        _id: userData.id || userData._id || userData.userId,
        id: userData.id || userData._id || userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'student',
        status: userData.status || 'approved',
        createdDate: userData.createdDate || new Date().toISOString(),
        lastModifiedDate: userData.lastModifiedDate || new Date().toISOString()
      };
      
      console.log('Login - Normalized user:', normalizedUser);
      
      if (normalizedUser._id) {
        setUser(normalizedUser);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem('token');
      setToken(null);
      // Clear axios headers
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-auth-token'];
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor') => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token: newToken } = res.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Update axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      const decoded: any = jwtDecode(newToken);
      console.log('Register - Decoded token:', decoded);
      
      const userData = decoded.user || decoded;
      
      const normalizedUser = {
        _id: userData.id || userData._id || userData.userId,
        id: userData.id || userData._id || userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || role,
        status: userData.status || 'approved',
        createdDate: userData.createdDate || new Date().toISOString(),
        lastModifiedDate: userData.lastModifiedDate || new Date().toISOString()
      };
      
      console.log('Register - Normalized user:', normalizedUser);
      
      if (normalizedUser._id) {
        setUser(normalizedUser);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error("Registration failed:", error);
      localStorage.removeItem('token');
      setToken(null);
      // Clear axios headers
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-auth-token'];
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Clear axios headers
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};