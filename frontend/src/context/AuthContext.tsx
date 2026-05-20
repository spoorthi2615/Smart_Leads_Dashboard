import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: AuthResponse) => void;
  logout: () => void;
  setError: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface StoredAuthState {
  user: User | null;
  token: string | null;
  error: string | null;
}

function readStoredAuth(): StoredAuthState {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser) as User,
        error: null,
      };
    }
  } catch {
    return {
      user: null,
      token: null,
      error: 'Failed to restore authentication state.',
    };
  }

  return {
    user: null,
    token: null,
    error: null,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [storedAuth] = useState(readStoredAuth);
  const [user, setUser] = useState<User | null>(storedAuth.user);
  const [token, setToken] = useState<string | null>(storedAuth.token);
  const [error, setError] = useState<string | null>(storedAuth.error);
  const isLoading = false;
  const isInitialized = true;

  const login = useCallback((payload: AuthResponse) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    localStorage.setItem('token', payload.token);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isInitialized,
      isLoading,
      error,
      login,
      logout,
      setError,
    }),
    [user, token, isInitialized, isLoading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
