import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { SUBJECTS, type SubjectConfig } from './config';

export interface TeacherRecord {
  id: string;
  name: string;
  subject: string;
  className: string;
}

interface Store {
  subjects: SubjectConfig[];
  teachers: TeacherRecord[];
  upsertSubject: (s: SubjectConfig) => void;
  deleteSubject: (id: string) => void;
  upsertTeacher: (t: TeacherRecord) => void;
  deleteTeacher: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<SubjectConfig[]>(SUBJECTS);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);

  const value = useMemo<Store>(
    () => ({
      subjects,
      teachers,
      upsertSubject: (s) =>
        setSubjects((prev) => {
          const exists = prev.some((x) => x.id === s.id);
          return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
        }),
      deleteSubject: (id) => setSubjects((prev) => prev.filter((x) => x.id !== id)),
      upsertTeacher: (t) =>
        setTeachers((prev) => {
          const exists = prev.some((x) => x.id === t.id);
          return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [...prev, t];
        }),
      deleteTeacher: (id) => setTeachers((prev) => prev.filter((x) => x.id !== id)),
    }),
    [subjects, teachers],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
