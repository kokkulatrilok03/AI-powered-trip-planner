'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (authToken: string) => {
  document.cookie = `token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; max-age=0';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await authApi.me();
        setToken(storedToken);
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        setAuthCookie(storedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearAuthCookie();
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const persistAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuthCookie(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    persistAuth(data.data.token, data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register(name, email, password);
    persistAuth(data.data.token, data.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearAuthCookie();
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
