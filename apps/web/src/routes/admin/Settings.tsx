import { useState } from 'react';
import { useActiveClassTerm } from '../../hooks/useOversight';
import { useStore } from '../../mock/store';
import type { SubjectConfig } from '../../mock/config';
import { Card, Button, PageHeader } from '../../components/ui';

const emptySubject = (): SubjectConfig => ({ id: '', name: '', short: '' });

export function AdminSettingsPage() {
  const { classes, terms, activeClassId, activeTermId, activeClassName, activeTermName, setActiveClassId, setActiveTermId } = useActiveClassTerm();
  const { subjects, upsertSubject, deleteSubject } = useStore();

  const [editingSubject, setEditingSubject] = useState<SubjectConfig | null>(null);
  const [err, setErr] = useState('');

  function saveSubject() {
    if (!editingSubject) return;
    if (!editingSubject.name.trim() || !editingSubject.short.trim()) {
      setErr('Name and short code are required');
      return;
    }
    upsertSubject({
      ...editingSubject,
      id:    editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-'),
      short: editingSubject.short.trim().toUpperCase().slice(0, 4),
    });
    setEditingSubject(null);
    setErr('');
  }

  return (
    <div>
      <PageHeader kicker="Admin" title="Settings" sub="Active class · Subjects" />

      <Card className="mb-4">
        <div className="font-bold text-ink mb-3">Active class & term</div>

        {classes.length > 0 && (
          <>
            <div className="text-xs text-muted mb-1.5">Class</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {classes.map((c) => (
                <button key={c.id} onClick={() => setActiveClassId(c.id)}
                  className={`h-11 rounded-xl text-sm font-bold transition active:scale-[.97] ${c.id === activeClassId ? 'bg-accent text-white shadow-sm' : 'bg-bg text-muted border border-line hover:text-ink'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </>
        )}

        {terms.length > 0 && (
          <>
            <div className="text-xs text-muted mb-1.5">Term</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {terms.map((t) => (
                <button key={t.id} onClick={() => setActiveTermId(t.id)}
                  className={`h-11 rounded-xl text-sm font-bold transition active:scale-[.97] ${t.id === activeTermId ? 'bg-accent text-white shadow-sm' : 'bg-bg text-muted border border-line hover:text-ink'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </>
        )}

        {(activeClassName || activeTermName) && (
          <div className="flex items-center gap-2 bg-accent-soft rounded-xl px-4 py-3">
            <span className="text-xs text-accent-ink font-semibold">Active now:</span>
            <span className="font-bold text-accent-ink">{activeClassName}</span>
            {activeTermName && <><span className="text-faint">·</span><span className="font-bold text-accent-ink">{activeTermName}</span></>}
          </div>
        )}

        {classes.length === 0 && (
          <div className="text-faint text-sm">No classes yet — add assignments first</div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-ink">Subjects</div>
          <Button className="h-8 px-3 text-xs" onClick={() => { setEditingSubject(emptySubject()); setErr(''); }}>+ Add</Button>
        </div>

        {editingSubject ? (
          <div className="bg-bg rounded-2xl p-3 mb-3">
            <div className="text-sm font-semibold text-ink mb-2">{editingSubject.id ? 'Edit' : 'New'} subject</div>
            <label className="text-xs text-muted">Subject name</label>
            <input value={editingSubject.name} onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
              placeholder="e.g. Mathematics"
              className="w-full h-10 rounded-lg border border-line px-3 text-sm mt-0.5 mb-2 outline-none focus:border-accent" />
            <label className="text-xs text-muted">Short code (2–4 chars)</label>
            <input value={editingSubject.short} onChange={(e) => setEditingSubject({ ...editingSubject, short: e.target.value.toUpperCase().slice(0, 4) })}
              placeholder="e.g. MA" maxLength={4}
              className="w-full h-10 rounded-lg border border-line px-3 text-sm mt-0.5 mb-2 outline-none focus:border-accent" />
            {err && <div className="text-status-overdue text-xs mb-2">{err}</div>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 h-9 text-xs" onClick={() => { setEditingSubject(null); setErr(''); }}>Cancel</Button>
              <Button className="flex-1 h-9 text-xs" onClick={saveSubject}>Save</Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-display font-extrabold text-sm flex-none" style={{ background: '#ECEBFD', color: '#463FBF' }}>
                {s.short}
              </span>
              <div className="flex-1 text-sm font-semibold text-ink">{s.name}</div>
              <div className="flex gap-1">
                <Button variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => { setEditingSubject(s); setErr(''); }}>Edit</Button>
                <Button variant="danger" className="h-8 px-2.5 text-xs" onClick={() => deleteSubject(s.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {subjects.length === 0 && <div className="text-faint text-sm text-center py-4">No subjects yet</div>}
        </div>
      </Card>
    </div>
  );
}
