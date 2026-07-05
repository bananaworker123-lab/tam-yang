import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ProgressStatus } from '@homework-tracker/shared-types';

export interface ProgressRow {
  progressId: string | null;
  assignmentId: string; subject: string; subjectShort: string; topic: string; teacherName: string;
  className: string; term: string;
  assignedDate: string; dueDate: string;
  status: ProgressStatus;
}

export function useProgress(childId?: string, assignmentId?: string) {
  const qc = useQueryClient();
  const params = new URLSearchParams();
  if (childId)      params.set('childId', childId);
  if (assignmentId) params.set('assignmentId', assignmentId);

  // When fetching a single item, seed from the full-list cache so navigating from
  // Dashboard shows the detail instantly without a new network round-trip.
  const initialData = assignmentId
    ? qc.getQueryData<ProgressRow[]>(['progress', childId])
        ?.filter((r) => r.assignmentId === assignmentId)
    : undefined;

  return useQuery<ProgressRow[]>({
    queryKey: assignmentId ? ['progress', childId, assignmentId] : ['progress', childId],
    queryFn: () => api.get(`/progress?${params.toString()}`),
    staleTime: 1000 * 60 * 2,
    initialData,
    initialDataUpdatedAt: initialData
      ? qc.getQueryState(['progress', childId])?.dataUpdatedAt
      : undefined,
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, progressId, childId, status }: {
      assignmentId: string; progressId: string | null; childId?: string; status: ProgressStatus;
    }): Promise<{ progressId: string; status: ProgressStatus }> =>
      api.patch(`/progress/${assignmentId}`, { progressId, childId, status }),
    onMutate: async ({ assignmentId, childId, status }) => {
      await qc.cancelQueries({ queryKey: ['progress', childId] });
      const snapshots = qc.getQueriesData<ProgressRow[]>({ queryKey: ['progress', childId] });
      qc.setQueriesData<ProgressRow[]>({ queryKey: ['progress', childId] }, (old) =>
        old?.map((r) => r.assignmentId === assignmentId ? { ...r, status } : r),
      );
      return { snapshots };
    },
    onSuccess: (data: { progressId: string; status: ProgressStatus }, { assignmentId, childId }) => {
      // confirm optimistic update with server values — no full refetch needed
      qc.setQueriesData<ProgressRow[]>({ queryKey: ['progress', childId] }, (old) =>
        old?.map((r) => r.assignmentId === assignmentId
          ? { ...r, progressId: data.progressId, status: data.status }
          : r),
      );
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, val]) => qc.setQueryData(key, val));
    },
  });
}
