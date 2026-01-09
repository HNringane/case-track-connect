import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'victim' | 'police' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  anonymous: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  saId: string;
  phone: string;
  email?: string;
  password: string;
  anonymous: boolean;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - in production, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({
      id: '1',
      name: role === 'victim' ? 'Anonymous User' : 'Officer Smith',
      email,
      role,
      anonymous: role === 'victim',
    });
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({
      id: '1',
      name: data.anonymous ? 'Anonymous User' : data.fullName,
      email: data.email || '',
      role: data.role,
      anonymous: data.anonymous,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
