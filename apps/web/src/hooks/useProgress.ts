import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ProgressStatus } from '@homework-tracker/shared-types';

export interface ProgressRow {
  progressId: string | null;
  assignmentId: string; subject: string; topic: string; teacherName: string;
  className: string; term: string;
  assignedDate: string; dueDate: string;
  status: ProgressStatus;
}

export function useProgress(childId?: string, className?: string, termName?: string) {
  const params = new URLSearchParams();
  if (childId)   params.set('childId', childId);
  if (className) params.set('className', className);
  if (termName)  params.set('termName', termName);

  return useQuery<ProgressRow[]>({
    queryKey: ['progress', childId, className, termName],
    queryFn: () => api.get(`/progress?${params.toString()}`),
    enabled: !!className && !!termName,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, progressId, childId, status }: {
      assignmentId: string; progressId: string | null; childId?: string; status: ProgressStatus;
    }) => api.patch(`/progress/${assignmentId}`, { progressId, childId, status }),
    onMutate: async ({ assignmentId, status }) => {
      await qc.cancelQueries({ queryKey: ['progress'] });
      const snapshots = qc.getQueriesData<ProgressRow[]>({ queryKey: ['progress'] });
      qc.setQueriesData<ProgressRow[]>({ queryKey: ['progress'] }, (old) =>
        old?.map((r) => r.assignmentId === assignmentId ? { ...r, status } : r),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });
}
