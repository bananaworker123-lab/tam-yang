import { useState } from 'react';
import { useAdminTeachers, useAssignTeacher, useRemoveTeacher, useClasses } from '../../hooks/useOversight';
import { Card, Avatar, Button, PageHeader, EmptyState } from '../../components/ui';

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export function AdminTeachersPage() {
  const { data: teachers = [], isLoading } = useAdminTeachers();
  const { data: classes = [] } = useClasses();
  const assignTeacher = useAssignTeacher();
  const removeTeacher = useRemoveTeacher();

  const [email, setEmail]       = useState('');
  const [className, setClassName] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [err, setErr] = useState('');
  const [showing, setShowing] = useState(false);

  const effectiveClass = className === '__custom__' ? customClass : className;

  async function handleAssign() {
    if (!email.trim() || !effectiveClass.trim()) {
      setErr('Email and class are required');
      return;
    }
    try {
      await assignTeacher.mutateAsync({ email: email.trim(), className: effectiveClass.trim() });
      setEmail('');
      setClassName('');
      setCustomClass('');
      setErr('');
      setShowing(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to assign teacher');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader kicker="Admin" title="Teachers" sub="Class access assignments" />

      {showing ? (
        <Card className="mb-4">
          <div className="font-bold text-ink mb-3">Assign teacher to class</div>

          <label className="text-xs text-muted">Teacher Gmail</label>
          <input value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }}
            placeholder="teacher@gmail.com"
            className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent" />

          <label className="text-xs text-muted">Class</label>
          <select value={className} onChange={(e) => { setClassName(e.target.value); setErr(''); }}
            className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-1 outline-none focus:border-accent">
            <option value="">— select class —</option>
            {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value="__custom__">Other (type below)</option>
          </select>

          {className === '__custom__' && (
            <input value={customClass} onChange={(e) => { setCustomClass(e.target.value); setErr(''); }}
              placeholder="e.g. M.5/2"
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 mb-3 outline-none focus:border-accent" />
          )}

          {err && <div className="text-status-overdue text-xs mb-2">{err}</div>}

          <div className="flex gap-2 mt-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowing(false); setErr(''); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleAssign} disabled={assignTeacher.isPending}>
              {assignTeacher.isPending ? 'Assigning…' : 'Assign teacher'}
            </Button>
          </div>
        </Card>
      ) : (
        <Button className="w-full mb-4" onClick={() => setShowing(true)}>+ Assign teacher</Button>
      )}

      {teachers.length === 0 ? (
        <EmptyState title="No teachers assigned yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {teachers.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center gap-3">
                <Avatar initials={initials(t.teacherName)} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm">{t.teacherName}</div>
                  <div className="text-xs text-muted">{t.teacherEmail} · <span className="font-semibold text-accent-ink">{t.className}</span></div>
                </div>
                <Button variant="danger" className="h-9 px-3 text-xs"
                  onClick={() => removeTeacher.mutate(t.id)}
                  disabled={removeTeacher.isPending}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
