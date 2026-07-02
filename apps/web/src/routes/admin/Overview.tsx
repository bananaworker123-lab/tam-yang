import { useState } from 'react';
import { useAdminOverview, useActiveClassTerm } from '../../hooks/useOversight';
import { useStore } from '../../mock/store';
import type { SubjectConfig } from '../../mock/config';
import { Card, Avatar, Button, PageHeader } from '../../components/ui';

const emptySubject = (): SubjectConfig => ({ id: '', name: '', short: '' });

function ConfigPanel({ onClose }: { onClose: () => void }) {
  const { classes, terms, activeClassId, activeTermId, activeClassName, activeTermName, setActiveClassId, setActiveTermId } = useActiveClassTerm();
  const { subjects, upsertSubject, deleteSubject } = useStore();
  const [editingSubject, setEditingSubject] = useState<SubjectConfig | null>(null);
  const [err, setErr] = useState('');

  function saveSubject() {
    if (!editingSubject) return;
    if (!editingSubject.name.trim() || !editingSubject.short.trim()) { setErr('Name and short code are required'); return; }
    upsertSubject({
      ...editingSubject,
      id: editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-'),
      short: editingSubject.short.trim().toUpperCase().slice(0, 4),
    });
    setEditingSubject(null);
    setErr('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 pb-6 md:pb-0" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto flex flex-col gap-4 p-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink text-base">Config</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:bg-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Active class & term */}
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Active class & term</div>
          {classes.length > 0 && (
            <>
              <div className="text-xs text-muted mb-1">Class</div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {classes.map((c) => (
                  <button key={c.id} onClick={() => setActiveClassId(c.id)}
                    className={`h-10 rounded-xl text-xs font-bold transition ${c.id === activeClassId ? 'bg-accent text-white' : 'bg-bg text-muted border border-line hover:text-ink'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {terms.length > 0 && (
            <>
              <div className="text-xs text-muted mb-1">Term</div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {terms.map((t) => (
                  <button key={t.id} onClick={() => setActiveTermId(t.id)}
                    className={`h-10 rounded-xl text-xs font-bold transition ${t.id === activeTermId ? 'bg-accent text-white' : 'bg-bg text-muted border border-line hover:text-ink'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {(activeClassName || activeTermName) && (
            <div className="flex items-center gap-2 bg-accent-soft rounded-xl px-3 py-2">
              <span className="text-xs text-accent-ink font-semibold">Active:</span>
              <span className="font-bold text-accent-ink text-xs">{activeClassName}</span>
              {activeTermName && <><span className="text-faint">·</span><span className="font-bold text-accent-ink text-xs">{activeTermName}</span></>}
            </div>
          )}
          {classes.length === 0 && <div className="text-faint text-xs">No classes yet</div>}
        </div>

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">Subjects</div>
            <Button className="h-7 px-2.5 text-xs" onClick={() => { setEditingSubject(emptySubject()); setErr(''); }}>+ Add</Button>
          </div>

          {editingSubject && (
            <div className="bg-bg rounded-xl p-3 mb-3">
              <div className="text-xs font-semibold text-ink mb-2">{editingSubject.id ? 'Edit' : 'New'} subject</div>
              <input value={editingSubject.name} onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                placeholder="Subject name"
                className="w-full h-9 rounded-lg border border-line px-3 text-xs mb-2 outline-none focus:border-accent" />
              <input value={editingSubject.short} onChange={(e) => setEditingSubject({ ...editingSubject, short: e.target.value.toUpperCase().slice(0, 4) })}
                placeholder="Short code (e.g. MA)" maxLength={4}
                className="w-full h-9 rounded-lg border border-line px-3 text-xs mb-2 outline-none focus:border-accent" />
              {err && <div className="text-status-overdue text-xs mb-2">{err}</div>}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 h-8 text-xs" onClick={() => { setEditingSubject(null); setErr(''); }}>Cancel</Button>
                <Button className="flex-1 h-8 text-xs" onClick={saveSubject}>Save</Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-display font-extrabold text-xs flex-none" style={{ background: '#ECEBFD', color: '#463FBF' }}>
                  {s.short}
                </span>
                <div className="flex-1 text-sm font-semibold text-ink">{s.name}</div>
                <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditingSubject(s); setErr(''); }}>Edit</Button>
                <Button variant="danger" className="h-7 px-2 text-xs" onClick={() => deleteSubject(s.id)}>Del</Button>
              </div>
            ))}
            {subjects.length === 0 && <div className="text-faint text-xs text-center py-3">No subjects yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview();
  const [showConfig, setShowConfig] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  const d = data!;
  type StatCard = { label: string; value: number; icon: string; color?: string };
  const stats: StatCard[] = [
    { label: 'Families',         value: d.familyCount,           icon: '🏠' },
    { label: 'Parents',          value: d.parentCount,           icon: '👨‍👩‍👧' },
    { label: 'Students',         value: d.childCount,            icon: '🎒' },
    { label: 'Teachers',         value: d.teacherCount,          icon: '🧑‍🏫' },
    { label: 'Active tasks',     value: d.activeAssignmentCount, icon: '📚' },
    { label: 'Pending requests', value: d.pendingRequestCount,   icon: '📨', color: d.pendingRequestCount > 0 ? '#D5403F' : undefined },
  ];

  const teacherNames = [...new Set(d.assignments.map((a) => a.teacherName))];

  return (
    <div>
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}

      <div className="flex items-center justify-between mb-4">
        <PageHeader kicker="Admin" title="Overview" />
        <button onClick={() => setShowConfig(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line text-xs font-semibold text-muted hover:bg-bg hover:text-ink transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Config
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xs text-muted font-semibold">{s.label}</span>
            </div>
            <div className="font-display font-extrabold text-3xl" style={{ color: s.color ?? '#1B1A2A' }}>
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <div className="font-bold text-ink mb-3">Families</div>
        {d.families.length === 0 ? (
          <div className="text-faint text-sm">No families yet</div>
        ) : (
          <div className="flex flex-col gap-3">
            {d.families.map((f) => {
              const parents = f.members.filter((m) => m.role === 'parent');
              const kids    = f.members.filter((m) => m.role === 'child');
              return (
                <div key={f.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink">{f.name || <span className="italic text-faint">Unnamed</span>}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {parents.length} parent{parents.length !== 1 ? 's' : ''} · {kids.length} child{kids.length !== 1 ? 'ren' : ''}
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    {f.members.slice(0, 3).map((m) => (
                      <span key={m.userId} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-soft text-accent-ink text-[10px] font-bold border-2 border-white">
                        {m.name.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                    {f.members.length > 3 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bg text-faint text-[10px] font-bold border-2 border-white">
                        +{f.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="font-bold text-ink mb-3">Teachers with assignments</div>
        {teacherNames.length === 0 ? (
          <div className="text-faint text-sm">No assignments yet</div>
        ) : (
          teacherNames.map((name) => {
            const count = d.assignments.filter((a) => a.teacherName === name && a.active).length;
            const ini = name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={name} className="flex items-center gap-3 mb-2.5 last:mb-0">
                <Avatar initials={ini} />
                <div className="flex-1 text-sm font-semibold text-ink">{name}</div>
                <span className="text-xs text-faint font-semibold">{count} active</span>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
