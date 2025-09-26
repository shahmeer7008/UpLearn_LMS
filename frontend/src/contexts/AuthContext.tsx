import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'student' | 'instructor') => Promise<boolean>;
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
    // Check for existing session
    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app, this would call backend API
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Student',
        email: 'student@example.com',
        role: 'student',
        status: 'active',
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mike Instructor',
        email: 'instructor@example.com',
        role: 'instructor',
        status: 'active',
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('lms_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor'): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      status: 'active',
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('lms_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};