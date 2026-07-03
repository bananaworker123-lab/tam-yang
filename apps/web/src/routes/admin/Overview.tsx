import { useState } from 'react';
import { useAdminOverview, useActiveClassTerm, useAdminFamilies } from '../../hooks/useOversight';
import { useStore, type TeacherRecord } from '../../mock/store';
import type { SubjectConfig } from '../../mock/config';
import { Card, Avatar, Button, PageHeader } from '../../components/ui';
import type { AdminFamily } from '../../hooks/useOversight';

const CLASSES = ['M.1', 'M.2', 'M.3', 'M.4', 'M.5', 'M.6'];
const emptySubject = (): SubjectConfig => ({ id: '', name: '', short: '' });
const emptyTeacher = (): TeacherRecord => ({ id: '', name: '', subject: '', className: '' });

function FamilyModal({ family, onClose }: { family: AdminFamily; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 pb-6 md:pb-0" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink text-base">{family.name || 'Unnamed family'}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:bg-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {family.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3">
              <Avatar initials={m.name.slice(0, 2).toUpperCase()} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">{m.name}</div>
                <div className="text-xs text-faint">{m.email}</div>
              </div>
              <span className="text-xs text-faint capitalize">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview();
  const { data: allFamilies = [] } = useAdminFamilies();
  const { classes, terms, activeClassId, activeTermId, activeClassName, activeTermName, setActiveClassId, setActiveTermId } = useActiveClassTerm();
  const { subjects, upsertSubject, deleteSubject, teachers, upsertTeacher, deleteTeacher } = useStore();

  const [selectedFamily, setSelectedFamily] = useState<AdminFamily | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectConfig | null>(null);
  const [subjectErr, setSubjectErr] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [teacherErr, setTeacherErr] = useState('');
  const [editingClassTerm, setEditingClassTerm] = useState(false);

  function saveSubject() {
    if (!editingSubject) return;
    if (!editingSubject.name.trim() || !editingSubject.short.trim()) { setSubjectErr('Name and short code are required'); return; }
    upsertSubject({
      ...editingSubject,
      id: editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-'),
      short: editingSubject.short.trim().toUpperCase().slice(0, 4),
    });
    setEditingSubject(null);
    setSubjectErr('');
  }

  function saveTeacher() {
    if (!editingTeacher) return;
    if (!editingTeacher.name.trim() || !editingTeacher.subject.trim() || !editingTeacher.className.trim()) {
      setTeacherErr('Name, subject and class are required');
      return;
    }
    upsertTeacher({
      ...editingTeacher,
      id: editingTeacher.id || `${Date.now()}`,
    });
    setEditingTeacher(null);
    setTeacherErr('');
  }

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

  const displayFamilies = allFamilies.length > 0 ? allFamilies : d.families;

  return (
    <div>
      {selectedFamily && <FamilyModal family={selectedFamily} onClose={() => setSelectedFamily(null)} />}

      <PageHeader kicker="Admin" title="Overview" />

      {/* Stats */}
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

      {/* Active class & term inline */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-muted uppercase tracking-wide">Active class &amp; term</div>
          {!editingClassTerm && (
            <button onClick={() => setEditingClassTerm(true)}
              className="h-7 px-3 rounded-lg border border-line text-xs text-muted hover:bg-bg transition">
              Edit
            </button>
          )}
        </div>

        {editingClassTerm ? (
          <>
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
            {classes.length === 0 && <div className="text-faint text-xs mb-3">No classes yet — add assignments first</div>}
            <Button className="w-full h-9 text-sm" onClick={() => setEditingClassTerm(false)}>Done</Button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-accent-soft rounded-xl px-4 py-3">
              <div className="text-[10px] text-accent-ink font-bold uppercase tracking-wide mb-0.5">Class</div>
              <div className="font-bold text-accent-ink text-sm">{activeClassName || '—'}</div>
            </div>
            <div className="flex-1 bg-accent-soft rounded-xl px-4 py-3">
              <div className="text-[10px] text-accent-ink font-bold uppercase tracking-wide mb-0.5">Term</div>
              <div className="font-bold text-accent-ink text-sm">{activeTermName || '—'}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Families */}
      <Card className="mb-4">
        <div className="font-bold text-ink mb-3">Families</div>
        {displayFamilies.length === 0 ? (
          <div className="text-faint text-sm">No families yet</div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayFamilies.map((f) => {
              const parents = f.members.filter((m) => m.role === 'parent');
              const kids    = f.members.filter((m) => m.role === 'child');
              return (
                <button key={f.id} onClick={() => setSelectedFamily(f)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-bg transition">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink">{f.name || <span className="italic text-faint">Unnamed</span>}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {parents.length} parent{parents.length !== 1 ? 's' : ''} · {kids.length} child{kids.length !== 1 ? 'ren' : ''}
                    </div>
                  </div>
                  <div className="flex -space-x-1.5 flex-none">
                    {f.members.slice(0, 3).map((m) => (
                      <span key={m.userId} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-soft text-accent-ink text-[10px] font-bold border-2 border-white">
                        {m.name.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B99AD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-none"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Subjects */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-ink">Subjects</div>
          <Button className="h-7 px-2.5 text-xs" onClick={() => { setEditingSubject(emptySubject()); setSubjectErr(''); }}>+ Add</Button>
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
            {subjectErr && <div className="text-status-overdue text-xs mb-2">{subjectErr}</div>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 h-8 text-xs" onClick={() => { setEditingSubject(null); setSubjectErr(''); }}>Cancel</Button>
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
              <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditingSubject(s); setSubjectErr(''); }}>Edit</Button>
              <Button variant="danger" className="h-7 px-2 text-xs" onClick={() => deleteSubject(s.id)}>Del</Button>
            </div>
          ))}
          {subjects.length === 0 && <div className="text-faint text-xs text-center py-3">No subjects yet</div>}
        </div>
      </Card>

      {/* Teachers */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-ink">Teachers</div>
          <Button className="h-7 px-2.5 text-xs" onClick={() => { setEditingTeacher(emptyTeacher()); setTeacherErr(''); }}>+ Add</Button>
        </div>

        {editingTeacher && (
          <div className="bg-bg rounded-xl p-3 mb-3">
            <div className="text-xs font-semibold text-ink mb-2">{editingTeacher.id ? 'Edit' : 'Add'} teacher</div>

            <label className="text-[11px] text-muted">Name</label>
            <input value={editingTeacher.name} onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
              placeholder="e.g. Ms. Smith"
              className="w-full h-9 rounded-lg border border-line px-3 text-xs mt-0.5 mb-2 outline-none focus:border-accent" />

            <label className="text-[11px] text-muted">Subject</label>
            <input value={editingTeacher.subject} onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
              placeholder="e.g. Mathematics" list="subject-options"
              className="w-full h-9 rounded-lg border border-line px-3 text-xs mt-0.5 mb-2 outline-none focus:border-accent" />
            <datalist id="subject-options">
              {subjects.map((s) => <option key={s.id} value={s.name} />)}
            </datalist>

            <label className="text-[11px] text-muted">Class</label>
            <select value={editingTeacher.className} onChange={(e) => setEditingTeacher({ ...editingTeacher, className: e.target.value })}
              className="w-full h-9 rounded-lg border border-line px-3 text-xs mt-0.5 mb-2 outline-none focus:border-accent">
              <option value="">— select class —</option>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              {classes.filter((c) => !CLASSES.includes(c.name)).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            {teacherErr && <div className="text-status-overdue text-xs mb-2">{teacherErr}</div>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 h-8 text-xs" onClick={() => { setEditingTeacher(null); setTeacherErr(''); }}>Cancel</Button>
              <Button className="flex-1 h-8 text-xs" onClick={saveTeacher}>Save</Button>
            </div>
          </div>
        )}

        {teachers.length === 0 && !editingTeacher ? (
          <div className="text-faint text-sm text-center py-3">No teachers added yet</div>
        ) : (
          <div className="flex flex-col gap-2">
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <Avatar initials={t.name.slice(0, 2).toUpperCase()} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm">{t.name}</div>
                  <div className="text-xs text-muted">{t.subject} · <span className="text-accent-ink font-semibold">{t.className}</span></div>
                </div>
                <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditingTeacher(t); setTeacherErr(''); }}>Edit</Button>
                <Button variant="danger" className="h-7 px-2 text-xs" onClick={() => deleteTeacher(t.id)}>Del</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
