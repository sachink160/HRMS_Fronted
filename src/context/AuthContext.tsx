import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token is still valid by fetching user profile
          await api.get('/auth/profile');
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error: any) {
      // Handle different types of error details
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Validation errors - extract the first error message
          const firstError = error.response.data.detail[0];
          if (firstError && typeof firstError === 'object' && firstError.msg) {
            errorMessage = firstError.msg;
          } else {
            errorMessage = 'Validation error occurred';
          }
        } else if (typeof error.response.data.detail === 'string') {
          // Simple string error
          errorMessage = error.response.data.detail;
        }
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};