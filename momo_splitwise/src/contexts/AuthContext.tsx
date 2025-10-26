import React, { createContext, useContext, useState, useEffect, type  ReactNode } from 'react';
import type { User, AuthContextType } from '../types';

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

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('momo_splitwise_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('momo_splitwise_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('momo_splitwise_user', JSON.stringify(userWithoutPassword));
      sessionStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('momo_splitwise_users') || '[]');
    
    if (users.find((u: any) => u.email === userData.email)) {
      return false;
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
    };

    users.push(newUser);
    localStorage.setItem('momo_splitwise_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('momo_splitwise_user', JSON.stringify(userWithoutPassword));
    sessionStorage.setItem('isAuthenticated', 'true');
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('momo_splitwise_user');
    sessionStorage.removeItem('isAuthenticated');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};