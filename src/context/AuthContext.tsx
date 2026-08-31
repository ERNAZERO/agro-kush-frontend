import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { clearToken, getToken, onUnauthorized, setToken } from '@/api/client';
import { useMe, userKeys } from '@/api/users';
import type { AuthenticateRequest, RegisterRequest, UserDto } from '@/types/dto';

interface AuthContextValue {
  user: UserDto | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: AuthenticateRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean>(() => !!getToken());
  const qc = useQueryClient();

  const { data: user, isLoading, isError } = useMe(hasToken);

  const logout = useCallback(() => {
    clearToken();
    setHasToken(false);
    qc.removeQueries({ queryKey: userKeys.all });
  }, [qc]);

  useEffect(() => {
    onUnauthorized(() => {
      setHasToken(false);
      qc.removeQueries({ queryKey: userKeys.all });
    });
  }, [qc]);

  // If the token is stale/invalid, /user/me will 401 and the interceptor already
  // cleared it — this just keeps local state in sync.
  useEffect(() => {
    if (hasToken && isError) {
      setHasToken(false);
    }
  }, [hasToken, isError]);

  const login = useCallback(
    async (request: AuthenticateRequest) => {
      const { token } = await authApi.login(request);
      setToken(token);
      setHasToken(true);
      await qc.invalidateQueries({ queryKey: userKeys.me() });
    },
    [qc],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      const { token } = await authApi.register(request);
      setToken(token);
      setHasToken(true);
      await qc.invalidateQueries({ queryKey: userKeys.me() });
    },
    [qc],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: hasToken && !!user,
      isLoading: hasToken && isLoading,
      login,
      register,
      logout,
    }),
    [user, hasToken, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
