import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useFamily() {
  const { user } = useAuth();
  const familyId = user?.familyId;
  return useQuery({
    queryKey: ['family', familyId],
    queryFn: () => api.get<{ familyName: string; members: unknown[]; invites: unknown[] }>(`/families/${familyId}/members`),
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

export function useUpdateMemberName() {
  const qc = useQueryClient();
  const { refetch } = useAuth();
  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      api.patch(`/users/${userId}/name`, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family'] }); refetch(); },
  });
}

export function useUpdateMemberShort() {
  const qc = useQueryClient();
  const { refetch } = useAuth();
  return useMutation({
    mutationFn: ({ userId, shortName }: { userId: string; shortName: string }) =>
      api.patch(`/users/${userId}/short-name`, { shortName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family'] }); refetch(); },
  });
}

export function useRemoveMember() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/families/${user?.familyId}/members/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family'] }),
  });
}

export function useInviteMember() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: 'parent' | 'child') =>
      api.post<{ inviteId: string; token: string }>(`/families/${user?.familyId}/invites`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family'] }),
  });
}
