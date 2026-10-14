import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  studentProfile?: {
    id: string;
    fullName: string;
    birthday?: string;
    university?: string;
    skills?: string;
    experience?: string;
    cvUrl?: string;
    avatarUrl?: string;
    completionPercent?: number;
  };
  employerProfile?: {
    id: string;
    companyName: string;
    phone: string;
    taxId: string;
    licenseFileUrl?: string;
    isVerified: boolean;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectReason?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isStudent: boolean;
  isEmployer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jobstudent_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('jobstudent_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.warn('Session expired or invalid, logging out.');
      localStorage.removeItem('jobstudent_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('jobstudent_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('jobstudent_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isStudent: user?.role === 'STUDENT',
        isEmployer: user?.role === 'EMPLOYER',
        isAdmin: user?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
