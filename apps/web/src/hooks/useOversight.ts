import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { ProgressStatus } from '@homework-tracker/shared-types';

export interface ClassRow { id: string; name: string; }
export interface TermRow  { id: string; name: string; }

export interface ActiveClassTermRow {
  classId: string | null; className: string | null;
  termId: string | null;  termName: string | null;
}

export function useActiveClassTermDB() {
  return useQuery<ActiveClassTermRow>({
    queryKey: ['oversight', 'active-class-term'],
    queryFn: () => api.get('/oversight/active-class-term'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSetActiveClassTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, termId }: { classId: string; termId: string }) =>
      api.patch('/oversight/admin/active-class-term', { classId, termId }),
    onSuccess: (data) => {
      qc.setQueryData(['oversight', 'active-class-term'], data);
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useClasses() {
  return useQuery<ClassRow[]>({
    queryKey: ['oversight', 'classes'],
    queryFn: () => api.get('/oversight/classes'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post('/oversight/admin/classes', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'classes'] }),
  });
}

export function useRenameClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/oversight/admin/classes/${id}`, { name }),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'classes'] });
      const prev = qc.getQueryData(['oversight', 'classes']);
      qc.setQueryData<ClassRow[]>(['oversight', 'classes'], (old) => old?.map((c) => c.id === id ? { ...c, name } : c));
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['oversight', 'classes'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'classes'] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/oversight/admin/classes/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'classes'] });
      const prev = qc.getQueryData(['oversight', 'classes']);
      qc.setQueryData<ClassRow[]>(['oversight', 'classes'], (old) => old?.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['oversight', 'classes'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'classes'] }),
  });
}

export function useTerms() {
  return useQuery<TermRow[]>({
    queryKey: ['oversight', 'terms'],
    queryFn: () => api.get('/oversight/terms'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post('/oversight/admin/terms', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'terms'] }),
  });
}

export function useRenameTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/oversight/admin/terms/${id}`, { name }),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'terms'] });
      const prev = qc.getQueryData(['oversight', 'terms']);
      qc.setQueryData<TermRow[]>(['oversight', 'terms'], (old) => old?.map((t) => t.id === id ? { ...t, name } : t));
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['oversight', 'terms'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'terms'] }),
  });
}

export function useDeleteTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/oversight/admin/terms/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'terms'] });
      const prev = qc.getQueryData(['oversight', 'terms']);
      qc.setQueryData<TermRow[]>(['oversight', 'terms'], (old) => old?.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['oversight', 'terms'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'terms'] }),
  });
}

/** Active class/term — source of truth is DB; localStorage used for instant display on reload. */
export function useActiveClassTerm() {
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: terms = [], isLoading: termsLoading } = useTerms();
  const { data: activeDB } = useActiveClassTermDB();
  const setActiveDB = useSetActiveClassTerm();

  const [activeClassId, setActiveClassIdState] = useState<string>(
    () => localStorage.getItem('activeClassId') ?? '',
  );
  const [activeTermId, setActiveTermIdState] = useState<string>(
    () => localStorage.getItem('activeTermId') ?? '',
  );

  // Sync from DB whenever the server value loads/changes
  useEffect(() => {
    if (activeDB?.classId && activeDB.classId !== activeClassId) {
      setActiveClassIdState(activeDB.classId);
      localStorage.setItem('activeClassId', activeDB.classId);
    }
    if (activeDB?.termId && activeDB.termId !== activeTermId) {
      setActiveTermIdState(activeDB.termId);
      localStorage.setItem('activeTermId', activeDB.termId);
    }
  }, [activeDB?.classId, activeDB?.termId]);

  // Fallback: auto-select first class/term if nothing active in DB yet
  useEffect(() => {
    if (classes.length > 0 && (!activeClassId || !classes.find((c) => c.id === activeClassId))) {
      const cls = classes[0]!;
      setActiveClassIdState(cls.id);
      localStorage.setItem('activeClassId', cls.id);
      localStorage.setItem('activeClassName', cls.name);
    } else if (activeClassId) {
      const cls = classes.find((c) => c.id === activeClassId);
      if (cls) localStorage.setItem('activeClassName', cls.name);
    }
  }, [classes, activeClassId]);

  useEffect(() => {
    if (terms.length > 0 && (!activeTermId || !terms.find((t) => t.id === activeTermId))) {
      const term = terms[0]!;
      setActiveTermIdState(term.id);
      localStorage.setItem('activeTermId', term.id);
      localStorage.setItem('activeTermName', term.name);
    } else if (activeTermId) {
      const term = terms.find((t) => t.id === activeTermId);
      if (term) localStorage.setItem('activeTermName', term.name);
    }
  }, [terms, activeTermId]);

  function setActiveClassId(id: string) {
    setActiveClassIdState(id);
    localStorage.setItem('activeClassId', id);
    const name = classes.find((c) => c.id === id)?.name ?? '';
    if (name) localStorage.setItem('activeClassName', name);
    if (id && activeTermId) setActiveDB.mutate({ classId: id, termId: activeTermId });
  }

  function setActiveTermId(id: string) {
    setActiveTermIdState(id);
    localStorage.setItem('activeTermId', id);
    const name = terms.find((t) => t.id === id)?.name ?? '';
    if (name) localStorage.setItem('activeTermName', name);
    if (activeClassId && id) setActiveDB.mutate({ classId: activeClassId, termId: id });
  }

  const activeClass = classes.find((c) => c.id === activeClassId);
  const activeTerm  = terms.find((t) => t.id === activeTermId);

  return {
    classes,
    terms,
    activeClassId,
    activeTermId,
    activeClassName: activeClass?.name ?? activeDB?.className ?? localStorage.getItem('activeClassName') ?? '',
    activeTermName:  activeTerm?.name  ?? activeDB?.termName  ?? localStorage.getItem('activeTermName')  ?? '',
    setActiveClassId,
    setActiveTermId,
    isLoading: classesLoading || termsLoading,
  };
}

// ---------- Teacher ----------

export interface TeacherOverviewCell { assignmentId: string; status: ProgressStatus; }
export interface TeacherOverviewRow  { childId: string; childName: string; childShort: string | null; pictureUrl: string | null; cells: TeacherOverviewCell[]; }
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
export interface AdminProgressRow { childId: string; childName: string; childShort: string | null; familyName: string; cells: { assignmentId: string; status: ProgressStatus }[]; }
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

// ---------- Subject catalog ----------

export interface SubjectRow { id: string; name: string; short: string; }

export function useSubjects() {
  return useQuery<SubjectRow[]>({
    queryKey: ['oversight', 'admin', 'subjects'],
    queryFn: () => api.get('/oversight/admin/subjects'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, short }: { id?: string; name: string; short: string }) =>
      id
        ? api.put(`/oversight/admin/subjects/${id}`, { name, short })
        : api.post('/oversight/admin/subjects', { name, short }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'subjects'] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/oversight/admin/subjects/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'admin', 'subjects'] });
      const prev = qc.getQueryData(['oversight', 'admin', 'subjects']);
      qc.setQueryData<SubjectRow[]>(['oversight', 'admin', 'subjects'], (old) => old?.filter((s) => s.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['oversight', 'admin', 'subjects'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'subjects'] }),
  });
}

// ---------- Teacher catalog ----------

export interface TeacherCatalogRow { id: string; name: string; subject: string; className: string; }

export function useTeacherCatalog() {
  return useQuery<TeacherCatalogRow[]>({
    queryKey: ['oversight', 'admin', 'teacher-catalog'],
    queryFn: () => api.get('/oversight/admin/teacher-catalog'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertTeacherCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, subject, className }: { id?: string; name: string; subject: string; className: string }) =>
      id
        ? api.put(`/oversight/admin/teacher-catalog/${id}`, { name, subject, className })
        : api.post('/oversight/admin/teacher-catalog', { name, subject, className }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'teacher-catalog'] }),
  });
}

export function useDeleteTeacherCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/oversight/admin/teacher-catalog/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['oversight', 'admin', 'teacher-catalog'] });
      const prev = qc.getQueryData(['oversight', 'admin', 'teacher-catalog']);
      qc.setQueryData<TeacherCatalogRow[]>(['oversight', 'admin', 'teacher-catalog'], (old) => old?.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['oversight', 'admin', 'teacher-catalog'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['oversight', 'admin', 'teacher-catalog'] }),
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
