import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { SUBJECTS, type SubjectConfig } from './config';

interface Store {
  subjects: SubjectConfig[];
  upsertSubject: (s: SubjectConfig) => void;
  deleteSubject: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<SubjectConfig[]>(SUBJECTS);

  const value = useMemo<Store>(
    () => ({
      subjects,
      upsertSubject: (s) =>
        setSubjects((prev) => {
          const exists = prev.some((x) => x.id === s.id);
          return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
        }),
      deleteSubject: (id) => setSubjects((prev) => prev.filter((x) => x.id !== id)),
    }),
    [subjects],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
