import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { ProgressStatus } from '@homework-tracker/shared-types';

export interface ClassRow { id: string; name: string; }
export interface TermRow  { id: string; name: string; }

export function useClasses() {
  return useQuery<ClassRow[]>({
    queryKey: ['oversight', 'classes'],
    queryFn: () => api.get('/oversight/classes'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTerms() {
  return useQuery<TermRow[]>({
    queryKey: ['oversight', 'terms'],
    queryFn: () => api.get('/oversight/terms'),
    staleTime: 1000 * 60 * 5,
  });
}

/** Persists active class/term in localStorage; auto-selects first when data loads. */
export function useActiveClassTerm() {
  const { data: classes = [] } = useClasses();
  const { data: terms = [] } = useTerms();

  const [activeClassId, setActiveClassIdState] = useState<string>(
    () => localStorage.getItem('activeClassId') ?? '',
  );
  const [activeTermId, setActiveTermIdState] = useState<string>(
    () => localStorage.getItem('activeTermId') ?? '',
  );

  useEffect(() => {
    if (!activeClassId && classes.length > 0) {
      const id = classes[0]!.id;
      setActiveClassIdState(id);
      localStorage.setItem('activeClassId', id);
    }
  }, [classes, activeClassId]);

  useEffect(() => {
    if (!activeTermId && terms.length > 0) {
      const id = terms[0]!.id;
      setActiveTermIdState(id);
      localStorage.setItem('activeTermId', id);
    }
  }, [terms, activeTermId]);

  function setActiveClassId(id: string) {
    setActiveClassIdState(id);
    localStorage.setItem('activeClassId', id);
  }

  function setActiveTermId(id: string) {
    setActiveTermIdState(id);
    localStorage.setItem('activeTermId', id);
  }

  const activeClass = classes.find((c) => c.id === activeClassId);
  const activeTerm  = terms.find((t) => t.id === activeTermId);

  return {
    classes,
    terms,
    activeClassId,
    activeTermId,
    activeClassName: activeClass?.name ?? '',
    activeTermName:  activeTerm?.name  ?? '',
    setActiveClassId,
    setActiveTermId,
  };
}

// ---------- Teacher ----------

export interface TeacherOverviewCell { assignmentId: string; status: ProgressStatus; }
export interface TeacherOverviewRow  { childId: string; childName: string; pictureUrl: string | null; cells: TeacherOverviewCell[]; }
export interface TeacherAssignmentInfo { id: string; subject: string; topic: string; dueDate: string; className: string; term: string; }
export interface TeacherOverview { assignments: TeacherAssignmentInfo[]; rows: TeacherOverviewRow[]; }

export function useTeacherOverview(className?: string, termName?: string) {
  const params = new URLSearchParams();
  if (className) params.set('className', className);
  if (termName)  params.set('termName', termName);
  return useQuery<TeacherOverview>({
    queryKey: ['oversight', 'teacher', className, termName],
    queryFn: () => api.get(`/oversight/teacher?${params}`),
    enabled: !!className && !!termName,
  });
}

// ---------- Admin ----------

export interface AdminFamilyMember { userId: string; name: string; email: string; role: string; pictureUrl: string | null; }
export interface AdminFamily { id: string; name: string; members: AdminFamilyMember[]; }

export interface AdminOverviewData {
  familyCount: number; childCount: number; parentCount: number;
  teacherCount: number; activeAssignmentCount: number; pendingRequestCount: number;
  families: AdminFamily[];
  assignments: { id: string; subject: string; teacherName: string; active: boolean }[];
  recentAudit: unknown[];
}

export function useAdminOverview() {
  return useQuery<AdminOverviewData>({
    queryKey: ['oversight', 'admin', 'overview'],
    queryFn: () => api.get('/oversight/admin/overview'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminFamilies() {
  return useQuery<AdminFamily[]>({
    queryKey: ['oversight', 'admin', 'families'],
    queryFn: () => api.get('/oversight/admin/families'),
    staleTime: 1000 * 60 * 2,
  });
}

export interface AdminProgressAssignment { id: string; subject: string; topic: string; dueDate: string; className: string; term: string; }
export interface AdminProgressRow { childId: string; childName: string; familyName: string; cells: { assignmentId: string; status: ProgressStatus }[]; }
export interface AdminProgressData { assignments: AdminProgressAssignment[]; rows: AdminProgressRow[]; }

export function useAdminAllProgress(className?: string, termName?: string) {
  const params = new URLSearchParams();
  if (className) params.set('className', className);
  if (termName)  params.set('termName', termName);
  return useQuery<AdminProgressData>({
    queryKey: ['oversight', 'admin', 'progress', className, termName],
    queryFn: () => api.get(`/oversight/admin/progress?${params}`),
    enabled: !!className && !!termName,
    staleTime: 1000 * 60 * 2,
  });
}

export interface AdminTeacherRow {
  id: string; teacherUserId: string; teacherName: string; teacherEmail: string;
  pictureUrl: string | null; className: string; classId: string;
}

export function useAdminTeachers() {
  return useQuery<AdminTeacherRow[]>({
    queryKey: ['oversight', 'admin', 'teachers'],
    queryFn: () => api.get('/oversight/admin/teachers'),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAssignTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, className }: { email: string; className: string }) =>
      api.post('/oversight/admin/teachers', { email, className }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'teachers'] }),
  });
}

export function useRemoveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/oversight/admin/teachers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'teachers'] }),
  });
}

// ---------- Audit ----------

export interface AuditEntry {
  id: string; eventId: string; actorUserId: string; actorRole: string;
  childUserId: string; assignmentId: string; fromStatus: string; toStatus: string;
  createdAt: string;
}

export function useAuditLog(q?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  return useQuery<AuditEntry[]>({
    queryKey: ['audit', q],
    queryFn: () => api.get(`/audit?${params}`),
  });
}
