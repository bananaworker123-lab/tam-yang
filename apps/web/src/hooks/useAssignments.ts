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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<AssignmentRow> & { id: string }) => api.patch(`/assignments/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
