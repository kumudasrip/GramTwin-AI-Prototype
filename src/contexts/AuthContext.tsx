import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'citizen' | 'org' | null;

interface User {
  email?: string;
  orgType?: string;
  placeName?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, orgType: string, placeName: string, role: 'org') => void;
  loginAsCitizen: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ role: null });

  useEffect(() => {
    // Always start with no authentication on app load
    // Users must login each time for this prototype
    localStorage.removeItem('gramtwin_user');
    localStorage.removeItem('gramtwin_role');
  }, []);

  const login = (email: string, orgType: string, placeName: string, role: 'org' = 'org') => {
    const newUser: User = { email, orgType, placeName, role };
    setUser(newUser);
  };

  const loginAsCitizen = () => {
    const newUser: User = { role: 'citizen' };
    setUser(newUser);
  };

  const logout = () => {
    setUser({ role: null });
    localStorage.removeItem('gramtwin_user');
    localStorage.removeItem('gramtwin_role');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user.role !== null,
    login,
    loginAsCitizen,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
