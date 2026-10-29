import axios from 'axios';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { AuthContext } from './auth-context';
import { authService } from '../services/authService';
import type { AuthUser, Credentials } from '../types/auth';

const TOKEN_STORAGE_KEY = 'aiin_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleExpiredAuthentication = () => {
      logout();
      setAuthError('Your session expired. Please sign in again.');
    };

    window.addEventListener('aiin:auth-expired', handleExpiredAuthentication);
    return () => {
      window.removeEventListener('aiin:auth-expired', handleExpiredAuthentication);
    };
  }, [logout]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      setIsLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then(setUser)
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
          return;
        }
        setAuthError('Unable to validate your session. Check your connection and try again.');
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  const acceptAuthResponse = (response: Awaited<ReturnType<typeof authService.login>>) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    setUser(response.user);
    setAuthError(null);
  };

  const login = async (credentials: Credentials) => {
    acceptAuthResponse(await authService.login(credentials));
  };

  const register = async (credentials: Credentials) => {
    acceptAuthResponse(await authService.register(credentials));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, authError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
