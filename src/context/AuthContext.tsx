import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 'usr-admin-01',
    email: 'sarah.connor@courtlens.internal',
    full_name: 'Lead Counsel Sarah Connor',
    role: 'ADMIN',
    organization: 'Department of Justice / Cyber Division',
    created_at: '2026-01-10T09:00:00Z'
  },
  INVESTIGATOR: {
    id: 'usr-inv-02',
    email: 'marcus.vance@courtlens.internal',
    full_name: 'Detective Marcus Vance',
    role: 'INVESTIGATOR',
    organization: 'Financial Crimes Task Force',
    created_at: '2026-01-12T10:30:00Z'
  },
  VIEWER: {
    id: 'usr-view-03',
    email: 'elena.rostova@courtlens.internal',
    full_name: 'Analyst Elena Rostova',
    role: 'VIEWER',
    organization: 'Judicial Review Office',
    created_at: '2026-02-01T14:00:00Z'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('courtlens_active_role') as UserRole) || 'INVESTIGATOR';
  });

  const [user, setUser] = useState<User | null>(DEMO_USERS[role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser(DEMO_USERS[newRole]);
    localStorage.setItem('courtlens_active_role', newRole);
  };

  const loginAs = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('courtlens_auth_token', `courtlens-jwt-${newRole.toLowerCase()}-session`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('courtlens_auth_token');
  };

  useEffect(() => {
    setUser(DEMO_USERS[role]);
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        loginAs,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
