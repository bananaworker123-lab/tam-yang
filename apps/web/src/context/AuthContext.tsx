import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

const CACHE_KEY = 'homeroom.user.v2';

function readCached(): AuthCtx | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthCtx) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const cached = readCached();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery<AuthCtx | null>({
    queryKey: ['me'],
    queryFn: () => api.get<AuthCtx & { familyMembers?: unknown }>('/me').catch(() => null),
    staleTime: 1000 * 60 * 5,
    retry: false,
    // Show cached user immediately — API result updates it in background
    initialData: cached ?? undefined,
    initialDataUpdatedAt: cached ? Date.now() - 1000 * 60 * 6 : 0, // treat cache as slightly stale so background refetch still runs
    select: (raw) => {
      if (!raw) return null;
      const { familyMembers, ...authCtx } = raw as AuthCtx & { familyMembers?: unknown };
      // Seed family cache immediately so Profile renders without a loading state
      if (familyMembers && authCtx.familyId) {
        qc.setQueryData(['family', authCtx.familyId], familyMembers);
      }
      return authCtx as AuthCtx;
    },
  });

  useEffect(() => {
    if (data?.userId) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    } else if (data === null) {
      try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    }
  }, [data?.userId, data?.roles?.join(',')]);

  return (
    <Ctx.Provider value={{ user: data ?? null, isLoading: isLoading && !cached, isLoggedIn: !!data?.userId, refetch }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
