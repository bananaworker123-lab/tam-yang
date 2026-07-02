import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AuthContext as AuthCtx } from '@homework-tracker/shared-types';

interface AuthState {
  user: AuthCtx | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refetch: () => void;
}

const Ctx = createContext<AuthState>({
  user: null, isLoading: true, isLoggedIn: false, refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useQuery<AuthCtx | null>({
    queryKey: ['me'],
    queryFn: () => api.get<AuthCtx>('/me').catch(() => null),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return (
    <Ctx.Provider value={{ user: data ?? null, isLoading, isLoggedIn: !!data?.userId, refetch }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
