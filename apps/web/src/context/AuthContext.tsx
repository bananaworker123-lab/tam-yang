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

  const { data: rawData, isLoading, refetch } = useQuery<(AuthCtx & { familyMembers?: unknown }) | null>({
    queryKey: ['me'],
    queryFn: () => api.get<AuthCtx & { familyMembers?: unknown }>('/me').catch(() => null),
    staleTime: 1000 * 60 * 5,
    retry: false,
    initialData: cached ?? undefined,
    initialDataUpdatedAt: cached ? Date.now() - 1000 * 60 * 6 : 0,
  });

  // Strip familyMembers from auth context (it's only for cache seeding)
  const data: AuthCtx | null = rawData
    ? (({ familyMembers: _fm, ...ctx }) => ctx as AuthCtx)(rawData as AuthCtx & { familyMembers?: unknown })
    : null;

  // Seed ['family'] cache only when fresh /me data arrives — not on every render.
  // Check cache is empty first so we never overwrite optimistic updates or live mutations.
  useEffect(() => {
    const raw = rawData as (AuthCtx & { familyMembers?: unknown }) | null | undefined;
    if (raw?.familyId && raw.familyMembers && !qc.getQueryData(['family', raw.familyId])) {
      qc.setQueryData(['family', raw.familyId], raw.familyMembers);
    }
  }, [rawData]);

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
