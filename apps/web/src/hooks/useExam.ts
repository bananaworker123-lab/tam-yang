import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ExamEvent {
  id: string;
  examType: 'midterm' | 'final' | 'out_of_schedule' | 'competition';
  subject: string;
  examDate: string;
  examTime: string | null;
  endTime: string | null;
  location: string | null;
  isOpenWindow: boolean;
  registrationDeadline: string | null;
  announcementDate: string | null;
  admitCardDate: string | null;
  isParticipating: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export function useExams(childId?: string) {
  const params = childId ? `?childId=${childId}` : '';
  return useQuery<ExamEvent[]>({
    queryKey: ['exams', childId],
    queryFn: () => api.get(`/exams${params}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ExamEvent>) => api.post('/exams', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<ExamEvent> & { id: string }) => api.patch(`/exams/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useParticipate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, childId }: { examId: string; childId?: string }) =>
      api.post(`/exams/${examId}/participate`, childId ? { childId } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useUnparticipate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, childId }: { examId: string; childId?: string }) =>
      api.delete(`/exams/${examId}/participate`, childId ? { childId } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useCompleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, childId }: { examId: string; childId?: string }) =>
      api.post(`/exams/${examId}/complete`, childId ? { childId } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useUncompleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, childId }: { examId: string; childId?: string }) =>
      api.delete(`/exams/${examId}/complete`, childId ? { childId } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}
