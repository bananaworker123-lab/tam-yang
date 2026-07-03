import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface RequestRow {
  id: string;
  createdBy: string;
  role: string;
  assignmentId?: string | null;
  detail: string;
  status: 'pending' | 'resolved' | 'rejected';
  reply?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useMyRequests() {
  return useQuery<RequestRow[]>({
    queryKey: ['requests', 'mine'],
    queryFn: () => api.get('/requests/mine'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllRequests() {
  return useQuery<RequestRow[]>({
    queryKey: ['requests', 'all'],
    queryFn: () => api.get('/requests'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ detail, assignmentId }: { detail: string; assignmentId?: string }) =>
      api.post('/requests', { detail, assignmentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useResolveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      api.post(`/requests/${id}/resolve`, { reply }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply?: string }) =>
      api.post(`/requests/${id}/reject`, { reply }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}
