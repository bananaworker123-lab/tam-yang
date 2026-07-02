import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useFamily() {
  const { user } = useAuth();
  const familyId = user?.familyId;
  return useQuery({
    queryKey: ['family', familyId],
    queryFn: () => api.get<{ members: unknown[]; invites: unknown[] }>(`/families/${familyId}/members`),
    enabled: !!familyId,
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  const { refetch } = useAuth();
  return useMutation({
    mutationFn: (name: string) => api.post<{ id: string }>('/families', { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); refetch(); },
  });
}

export function useInviteMember() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'parent' | 'child' }) =>
      api.post(`/families/${user?.familyId}/invites`, { email, role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family'] }),
  });
}
