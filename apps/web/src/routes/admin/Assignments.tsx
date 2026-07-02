import { useState } from 'react';
import { useActiveClassTerm } from '../../hooks/useOversight';
import { useAllAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '../../hooks/useAssignments';
import type { AssignmentRow } from '../../hooks/useAssignments';
import { Card, Button, PageHeader } from '../../components/ui';

const TOPIC_MAX = 120;

export function AdminAssignmentsPage() {
  const { classes, terms, activeClassName, activeTermName } = useActiveClassTerm();
  const [editing, setEditing] = useState<Partial<AssignmentRow> & { id?: string } | null>(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterTerm, setFilterTerm]   = useState('');

  const { data: assignments = [], isLoading } = useAllAssignments();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const allClassNames = [...new Set(assignments.map((a) => a.className))].sort();
  const allTermNames  = [...new Set(assignments.map((a) => a.term))].sort();
  const filtered = assignments.filter((a) => {
    if (filterClass && a.className !== filterClass) return false;
    if (filterTerm  && a.term      !== filterTerm)  return false;
    return true;
  });

  function openNew() {
    setEditing({
      subject: '', topic: '', teacherName: '',
      className: activeClassName || classes[0]?.name || '',
      term: activeTermName || terms[0]?.name || '',
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      active: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(a: AssignmentRow) {
    setEditing({ ...a });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!editing || !editing.topic?.trim() || !editing.teacherName?.trim() || !editing.subject?.trim()) return;
    const payload = { ...editing, topic: editing.topic.slice(0, TOPIC_MAX) } as AssignmentRow;
    if (editing.id) {
      const { id: _id, ...rest } = payload;
      await updateAssignment.mutateAsync({ id: editing.id, ...rest });
    } else {
      await createAssignment.mutateAsync(payload);
    }
    setEditing(null);
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader kicker="Admin" title="Assignment master" />

      {editing ? (
        <Card className="mb-4">
          <div className="font-bold text-ink mb-3">{editing.id ? 'Edit' : 'New'} assignment</div>

          <label className="text-xs text-muted">Teacher name</label>
          <input value={editing.teacherName ?? ''} onChange={(e) => setEditing({ ...editing, teacherName: e.target.value })}
            placeholder="e.g. Ms. Smith"
            className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent" />

          <label className="text-xs text-muted">Subject</label>
          <input value={editing.subject ?? ''} onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
            placeholder="e.g. Mathematics"
            className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent" />

          <label className="text-xs text-muted">Topic</label>
          <input value={editing.topic ?? ''} onChange={(e) => setEditing({ ...editing, topic: e.target.value.slice(0, TOPIC_MAX) })}
            placeholder="e.g. Homework p.12-16 red book, show working" maxLength={TOPIC_MAX}
            className={`w-full h-11 rounded-xl border px-3 text-sm mt-0.5 outline-none focus:border-accent ${(editing.topic?.length ?? 0) >= TOPIC_MAX ? 'border-status-overdue' : 'border-line'}`} />
          <div className={`text-right text-[11px] mt-0.5 mb-3 ${(editing.topic?.length ?? 0) >= TOPIC_MAX ? 'text-status-overdue font-bold' : 'text-faint'}`}>
            {editing.topic?.length ?? 0} / {TOPIC_MAX}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-muted">Class</label>
              <input value={editing.className ?? ''} onChange={(e) => setEditing({ ...editing, className: e.target.value })}
                placeholder="e.g. M.1" list="class-options"
                className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none focus:border-accent" />
              <datalist id="class-options">
                {classes.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-muted">Term</label>
              <input value={editing.term ?? ''} onChange={(e) => setEditing({ ...editing, term: e.target.value })}
                placeholder="e.g. Term 1" list="term-options"
                className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none focus:border-accent" />
              <datalist id="term-options">
                {terms.map((t) => <option key={t.id} value={t.name} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div><label className="text-xs text-muted">Assigned</label><input type="date" value={editing.assignedDate ?? ''} onChange={(e) => setEditing({ ...editing, assignedDate: e.target.value })} className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none" /></div>
            <div><label className="text-xs text-muted">Due</label><input type="date" value={editing.dueDate ?? ''} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none" /></div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            <Button className="flex-1" onClick={save}>{createAssignment.isPending || updateAssignment.isPending ? 'Saving…' : editing.id ? 'Save' : 'Add assignment'}</Button>
          </div>
        </Card>
      ) : (
        <Button className="w-full mb-4" onClick={openNew}>+ New assignment</Button>
      )}

      {!editing && (allClassNames.length > 0 || allTermNames.length > 0) && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {allClassNames.map((c) => <button key={c} onClick={() => setFilterClass(filterClass === c ? '' : c)} className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap flex-none ${filterClass === c ? 'bg-ink text-white' : 'bg-white border border-line text-muted'}`}>{c}</button>)}
          {allClassNames.length > 0 && allTermNames.length > 0 && <span className="text-line px-1">|</span>}
          {allTermNames.map((t) => <button key={t} onClick={() => setFilterTerm(filterTerm === t ? '' : t)} className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap flex-none ${filterTerm === t ? 'bg-accent text-white' : 'bg-white border border-line text-muted'}`}>{t}</button>)}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink leading-snug line-clamp-2">{a.topic || '(no topic)'}</div>
                <div className="text-xs text-muted mt-1">{a.teacherName} · {a.subject}</div>
                <div className="text-xs text-faint mt-0.5"><span className="font-semibold text-accent-ink">{a.className} · {a.term}</span> · due {a.dueDate}</div>
              </div>
              <button onClick={() => updateAssignment.mutate({ id: a.id, active: !a.active })}
                className={`h-7 px-2.5 rounded-full text-[11px] font-bold flex-none mt-0.5 ${a.active ? 'bg-status-submitted/15 text-[#1F7D52]' : 'bg-bg text-faint'}`}>
                {a.active ? 'active' : 'inactive'}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" className="flex-1 h-9 text-xs" onClick={() => openEdit(a)}>Edit</Button>
              <Button variant="danger" className="h-9 px-3 text-xs" onClick={() => deleteAssignment.mutate(a.id)}>Delete</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-faint text-sm">No assignments yet</div>}
      </div>
    </div>
  );
}
