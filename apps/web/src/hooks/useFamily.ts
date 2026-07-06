import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AuthContext as AuthCtx } from '@homework-tracker/shared-types';

export function useFamily() {
  const { user } = useAuth();
  const familyId = user?.familyId;
  return useQuery({
    queryKey: ['family', familyId],
    queryFn: () => api.get<{ familyName: string; members: unknown[]; invites: unknown[] }>(`/families/${familyId}/members`),
    enabled: !!familyId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
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
      // update sidebar user card instantly if editing own name
      if (userId === user?.userId) {
        qc.setQueryData<AuthCtx>(['me'], (old) => old ? { ...old, name } : old);
      }
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
      // update sidebar user card instantly if editing own shortName
      if (userId === user?.userId) {
        qc.setQueryData<AuthCtx>(['me'], (old) => old ? { ...old, shortName } : old);
      }
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
