import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AssignmentRow {
  id: string; subject: string; topic: string; teacherName: string;
  className: string; term: string;
  assignedDate: string; dueDate: string; active: boolean;
}

export function useActiveAssignments(className: string, termName: string) {
  return useQuery<AssignmentRow[]>({
    queryKey: ['assignments', 'active', className, termName],
    queryFn: () => api.get(`/assignments?className=${encodeURIComponent(className)}&termName=${encodeURIComponent(termName)}`),
    enabled: !!className && !!termName,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllAssignments() {
  return useQuery<AssignmentRow[]>({
    queryKey: ['assignments', 'all'],
    queryFn: () => api.get('/assignments?all=1'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<AssignmentRow, 'id'>) => api.post<AssignmentRow>('/assignments', body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ['assignments', 'all'] });
      const prev = qc.getQueryData(['assignments', 'all']);
      qc.setQueryData<AssignmentRow[]>(['assignments', 'all'], (old = []) => [
        ...old,
        { ...body, id: '__optimistic__' } as AssignmentRow,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['assignments', 'all'], ctx?.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<AssignmentRow> & { id: string }) => api.patch(`/assignments/${id}`, body),
    onMutate: async ({ id, ...body }) => {
      await qc.cancelQueries({ queryKey: ['assignments', 'all'] });
      const prev = qc.getQueryData(['assignments', 'all']);
      qc.setQueryData<AssignmentRow[]>(['assignments', 'all'], (old = []) =>
        old.map((a) => a.id === id ? { ...a, ...body } : a),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['assignments', 'all'], ctx?.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['assignments', 'all'] });
      const prev = qc.getQueryData(['assignments', 'all']);
      qc.setQueryData<AssignmentRow[]>(['assignments', 'all'], (old = []) =>
        old.filter((a) => a.id !== id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['assignments', 'all'], ctx?.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
