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
    mutationFn: ({ name, role }: { name: string; role: 'parent' | 'child' }) =>
      api.post<{ id: string }>('/families', { name, role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); refetch(); },
  });
}

export function useUpdateMemberName() {
  const qc = useQueryClient();
  const { user, refetch } = useAuth();
  const familyId = user?.familyId;
  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      api.patch(`/users/${userId}/name`, { name }),
    onMutate: async ({ userId, name }) => {
      await qc.cancelQueries({ queryKey: ['family', familyId] });
      const prev = qc.getQueryData(['family', familyId]);
      qc.setQueryData<any>(['family', familyId], (old: any) =>
        old ? { ...old, members: old.members.map((m: any) => m.userId === userId ? { ...m, name } : m) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['family', familyId], ctx?.prev),
    onSettled: () => { qc.invalidateQueries({ queryKey: ['family'] }); refetch(); },
  });
}

export function useUpdateMemberShort() {
  const qc = useQueryClient();
  const { user, refetch } = useAuth();
  const familyId = user?.familyId;
  return useMutation({
    mutationFn: ({ userId, shortName }: { userId: string; shortName: string }) =>
      api.patch(`/users/${userId}/short-name`, { shortName }),
    onMutate: async ({ userId, shortName }) => {
      await qc.cancelQueries({ queryKey: ['family', familyId] });
      const prev = qc.getQueryData(['family', familyId]);
      qc.setQueryData<any>(['family', familyId], (old: any) =>
        old ? { ...old, members: old.members.map((m: any) => m.userId === userId ? { ...m, shortName } : m) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['family', familyId], ctx?.prev),
    onSettled: () => { qc.invalidateQueries({ queryKey: ['family'] }); refetch(); },
  });
}

export function useRemoveMember() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const familyId = user?.familyId;
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/families/${familyId}/members/${userId}`),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['family', familyId] });
      const prev = qc.getQueryData(['family', familyId]);
      qc.setQueryData<any>(['family', familyId], (old: any) =>
        old ? { ...old, members: old.members.filter((m: any) => m.userId !== userId) } : old
      );
      return { prev };
    },
    onError: (_err, _userId, ctx) => qc.setQueryData(['family', familyId], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['family'] }),
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
