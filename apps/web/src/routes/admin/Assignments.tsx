import { useState } from 'react';
import { useActiveClassTerm, useTeacherCatalog } from '../../hooks/useOversight';
import { useAllAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '../../hooks/useAssignments';
import type { AssignmentRow } from '../../hooks/useAssignments';
import { Card, Button, PageHeader, SkeletonCard } from '../../components/ui';

const TOPIC_MAX = 120;

export function AdminAssignmentsPage() {
  const { activeClassName, activeTermName } = useActiveClassTerm();
  const { data: teachers = [] } = useTeacherCatalog();
  const [editing, setEditing] = useState<Partial<AssignmentRow> & { id?: string } | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterTerm, setFilterTerm]   = useState('');

  const { data: assignments = [], isLoading } = useAllAssignments();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const allClassNames = [...new Set(assignments.map((a) => a.className))].filter(Boolean).sort();
  const allTermNames  = [...new Set(assignments.map((a) => a.term))].filter(Boolean).sort();
  const filtered = assignments.filter((a) => {
    if (filterClass && a.className !== filterClass) return false;
    if (filterTerm  && a.term      !== filterTerm)  return false;
    return true;
  });

  function openNew() {
    setEditing({
      subject: '', topic: '', teacherName: '',
      className: activeClassName,
      term: activeTermName,
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      active: true,
    });
    setSelectedTeacherId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(a: AssignmentRow) {
    setEditing({ ...a });
    const match = teachers.find((t) => t.name === a.teacherName);
    setSelectedTeacherId(match?.id ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleTeacherSelect(teacherId: string) {
    setSelectedTeacherId(teacherId);
    const t = teachers.find((x) => x.id === teacherId);
    if (!t) return;
    setEditing((prev) => prev ? { ...prev, teacherName: t.name, subject: t.subject } : prev);
  }

  function save() {
    if (!editing || !editing.topic?.trim() || !editing.teacherName?.trim() || !editing.subject?.trim()) return;
    const className = activeClassName || editing.className || '';
    const term = activeTermName || editing.term || '';
    if (!className || !term) {
      setSaveErr('Please set an active Class and Term in Overview first');
      return;
    }
    const payload = {
      ...editing,
      topic: editing.topic.slice(0, TOPIC_MAX),
      className,
      term,
    } as AssignmentRow;
    setEditing(null);
    setSaveErr('');
    if (editing.id) {
      const { id: _id, ...rest } = payload;
      updateAssignment.mutate({ id: editing.id, ...rest });
    } else {
      createAssignment.mutate(payload);
    }
  }

  return (
    <div>
      <PageHeader kicker="Admin" title="Assignment master" />

      {editing ? (
        <Card className="mb-4">
          <div className="font-bold text-ink mb-3">{editing.id ? 'Edit' : 'New'} assignment</div>

          {/* Active class & term display */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-accent-soft rounded-xl px-3 py-2">
              <div className="text-[10px] text-accent-ink font-bold uppercase tracking-wide">Class</div>
              <div className="font-bold text-accent-ink text-sm">{activeClassName || editing.className || '—'}</div>
            </div>
            <div className="flex-1 bg-accent-soft rounded-xl px-3 py-2">
              <div className="text-[10px] text-accent-ink font-bold uppercase tracking-wide">Term</div>
              <div className="font-bold text-accent-ink text-sm">{activeTermName || editing.term || '—'}</div>
            </div>
          </div>

          {/* Teacher selector */}
          <label className="text-xs text-muted">Teacher</label>
          {teachers.length > 0 ? (
            <select
              value={selectedTeacherId}
              onChange={(e) => handleTeacherSelect(e.target.value)}
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent">
              <option value="" disabled>— select teacher —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} · {t.subject}</option>
              ))}
            </select>
          ) : (
            <input value={editing.teacherName ?? ''} onChange={(e) => setEditing({ ...editing, teacherName: e.target.value })}
              placeholder="e.g. Ms. Smith"
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent" />
          )}

          {/* Subject — read-only when teacher is selected from catalog */}
          <label className="text-xs text-muted">Subject</label>
          <input
            value={editing.subject ?? ''}
            readOnly={!!selectedTeacherId}
            onChange={(e) => !selectedTeacherId && setEditing({ ...editing, subject: e.target.value })}
            placeholder={teachers.length > 0 ? 'Auto-filled from teacher' : 'e.g. Mathematics'}
            className={`w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 mb-3 outline-none focus:border-accent ${selectedTeacherId ? 'bg-bg text-muted cursor-not-allowed' : 'bg-white'}`} />

          <label className="text-xs text-muted">Topic</label>
          <input value={editing.topic ?? ''} onChange={(e) => setEditing({ ...editing, topic: e.target.value.slice(0, TOPIC_MAX) })}
            placeholder="e.g. Homework p.12-16 red book, show working" maxLength={TOPIC_MAX}
            className={`w-full h-11 rounded-xl border px-3 text-sm mt-0.5 outline-none focus:border-accent ${(editing.topic?.length ?? 0) >= TOPIC_MAX ? 'border-status-overdue' : 'border-line'}`} />
          <div className={`text-right text-[11px] mt-0.5 mb-3 ${(editing.topic?.length ?? 0) >= TOPIC_MAX ? 'text-status-overdue font-bold' : 'text-faint'}`}>
            {editing.topic?.length ?? 0} / {TOPIC_MAX}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div><label className="text-xs text-muted">Assigned</label><input type="date" value={editing.assignedDate ?? ''} onChange={(e) => setEditing({ ...editing, assignedDate: e.target.value })} className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none" /></div>
            <div><label className="text-xs text-muted">Due</label><input type="date" value={editing.dueDate ?? ''} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-0.5 outline-none" /></div>
          </div>

          {saveErr && <div className="text-status-overdue text-xs mb-2">{saveErr}</div>}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setEditing(null); setSaveErr(''); }}>Cancel</Button>
            <Button className="flex-1" onClick={save}>{editing.id ? 'Save' : 'Add assignment'}</Button>
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
        {isLoading && assignments.length === 0 && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
