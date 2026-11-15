import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: () => Promise<void>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  switchToRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('pixelgrid_auth_user');
      if (stored) return JSON.parse(stored);
      // Default to guest/empty or customer demo on start
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const saveUserSession = (usr: User | null) => {
    setUser(usr);
    if (usr) {
      localStorage.setItem('pixelgrid_auth_user', JSON.stringify(usr));
    } else {
      localStorage.removeItem('pixelgrid_auth_user');
    }
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);

    const users = api.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (existing) {
      if (existing.isBlocked) {
        return { success: false, message: 'This account has been suspended by administration.' };
      }
      saveUserSession(existing);
      closeAuthModal();
      return { success: true };
    }

    // If logging in with admin credentials specifically
    if (email.toLowerCase() === 'momin09sarker@gmail.com') {
      const adminUser = users.find(u => u.role === 'admin') || users[0];
      saveUserSession(adminUser);
      closeAuthModal();
      return { success: true };
    }

    return { success: false, message: 'No account found with this email. Please register.' };
  };

  const googleLogin = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);

    // Simulate Google OAuth response
    const existingUsers = api.getUsers();
    let googleUser = existingUsers.find(u => u.email === 'tanvir.google@gmail.com');
    if (!googleUser) {
      googleUser = {
        id: `usr-g-${Date.now()}`,
        name: 'Tanvir Google Account',
        email: 'tanvir.google@gmail.com',
        phone: '01711223344',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Gulshan',
        postalCode: '1212',
        address: 'Road 32, Gulshan 1',
        createdAt: new Date().toISOString()
      };
      const users = [...existingUsers, googleUser];
      localStorage.setItem('pixelgrid_users_v1', JSON.stringify(users));
    }

    saveUserSession(googleUser);
    closeAuthModal();
  };

  const register = async (name: string, email: string, phone: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);

    const users = api.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('pixelgrid_users_v1', JSON.stringify(updatedUsers));
    saveUserSession(newUser);
    closeAuthModal();
    return { success: true };
  };

  const logout = () => {
    saveUserSession(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updated = api.updateUser(user.id, data);
    if (updated) {
      saveUserSession(updated);
      return true;
    }
    return false;
  };

  const switchToRole = (role: UserRole) => {
    const users = api.getUsers();
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      saveUserSession(targetUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        login,
        googleLogin,
        register,
        logout,
        updateProfile,
        switchToRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
