import { useState } from 'react';
import {
  useAdminOverview, useActiveClassTerm, useAdminFamilies,
  useCreateClass, useRenameClass, useDeleteClass, useCreateTerm, useRenameTerm, useDeleteTerm,
  useSubjects, useUpsertSubject, useDeleteSubject,
  useTeacherCatalog, useUpsertTeacherCatalog, useDeleteTeacherCatalog,
  type SubjectRow, type TeacherCatalogRow,
} from '../../hooks/useOversight';
import { Card, Avatar, Button, PageHeader, SkeletonLine } from '../../components/ui';
import type { AdminFamily } from '../../hooks/useOversight';

const emptySubject = (): SubjectRow => ({ id: '', name: '', short: '' });
const emptyTeacher = (): TeacherCatalogRow => ({ id: '', name: '', subject: '', className: '' });

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
              <Avatar initials={m.shortName?.toUpperCase() || m.name.slice(0, 2).toUpperCase()} />
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
  const { data, isLoading: overviewLoading } = useAdminOverview();
  const { data: allFamilies = [] } = useAdminFamilies();
  const {
    classes, terms,
    activeClassId, activeTermId,
    activeClassName, activeTermName,
    setActiveClassId, setActiveTermId,
  } = useActiveClassTerm();
  const { data: subjects = [] } = useSubjects();
  const { data: teachers = [] } = useTeacherCatalog();
  const upsertSubject   = useUpsertSubject();
  const deleteSubject   = useDeleteSubject();
  const upsertTeacher   = useUpsertTeacherCatalog();
  const deleteTeacher   = useDeleteTeacherCatalog();
  const createClass     = useCreateClass();
  const renameClass     = useRenameClass();
  const deleteClass     = useDeleteClass();
  const createTerm      = useCreateTerm();
  const renameTerm      = useRenameTerm();
  const deleteTerm      = useDeleteTerm();

  const [selectedFamily, setSelectedFamily] = useState<AdminFamily | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);
  const [subjectErr, setSubjectErr] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<TeacherCatalogRow | null>(null);
  const [teacherErr, setTeacherErr] = useState('');
  const [editingClassTerm, setEditingClassTerm] = useState(false);
  const [newClassName, setNewClassName]     = useState('');
  const [newTermName, setNewTermName]       = useState('');
  const [classErr, setClassErr]             = useState('');
  const [termErr, setTermErr]               = useState('');
  const [renamingClassId, setRenamingClassId] = useState('');
  const [renamingClassName, setRenamingClassName] = useState('');
  const [renamingTermId, setRenamingTermId]   = useState('');
  const [renamingTermName, setRenamingTermName] = useState('');

  function saveSubject() {
    if (!editingSubject) return;
    if (!editingSubject.name.trim() || !editingSubject.short.trim()) { setSubjectErr('Name and short code are required'); return; }
    setEditingSubject(null);
    setSubjectErr('');
    upsertSubject.mutate({ id: editingSubject.id || undefined, name: editingSubject.name.trim(), short: editingSubject.short.trim() });
  }

  function saveTeacher() {
    if (!editingTeacher) return;
    if (!editingTeacher.name.trim() || !editingTeacher.subject.trim() || !editingTeacher.className.trim()) {
      setTeacherErr('Name, subject and class are required');
      return;
    }
    setEditingTeacher(null);
    setTeacherErr('');
    upsertTeacher.mutate({ id: editingTeacher.id || undefined, name: editingTeacher.name.trim(), subject: editingTeacher.subject.trim(), className: editingTeacher.className.trim() });
  }

  function handleAddClass() {
    if (!newClassName.trim()) return;
    const name = newClassName.trim();
    setNewClassName('');
    setClassErr('');
    createClass.mutate(name, {
      onSuccess: (cls) => setActiveClassId((cls as { id: string }).id),
      onError: (e) => setClassErr(e instanceof Error ? e.message : 'Failed'),
    });
  }

  function handleAddTerm() {
    if (!newTermName.trim()) return;
    const name = newTermName.trim();
    setNewTermName('');
    setTermErr('');
    createTerm.mutate(name, {
      onSuccess: (t) => setActiveTermId((t as { id: string }).id),
      onError: (e) => setTermErr(e instanceof Error ? e.message : 'Failed'),
    });
  }

  const d = data;
  type StatCard = { label: string; value: number | undefined; icon: string; color?: string };
  const stats: StatCard[] = [
    { label: 'Families',         value: d?.familyCount,           icon: '🏠' },
    { label: 'Parents',          value: d?.parentCount,           icon: '👨‍👩‍👧' },
    { label: 'Students',         value: d?.childCount,            icon: '🎒' },
    { label: 'Teachers',         value: d?.teacherCount,          icon: '🧑‍🏫' },
    { label: 'Active tasks',     value: d?.activeAssignmentCount, icon: '📚' },
    { label: 'Pending requests', value: d?.pendingRequestCount,   icon: '📨', color: (d?.pendingRequestCount ?? 0) > 0 ? '#D5403F' : undefined },
  ];

  const displayFamilies = allFamilies.length > 0 ? allFamilies : (d?.families ?? []);

  return (
    <div>
      {selectedFamily && <FamilyModal family={selectedFamily} onClose={() => setSelectedFamily(null)} />}

      <PageHeader kicker="Admin" title="Overview" />

      {/* Stats */}
      <div className="rounded-[22px] text-white mb-5 overflow-hidden" style={{ background: 'linear-gradient(140deg,#5B53E0 0%,#7A5AF0 100%)', boxShadow: '0 18px 34px -16px rgba(91,83,224,.7)' }}>
        <div className="grid grid-cols-3 divide-x divide-white/15">
          {stats.slice(0, 3).map((s, i) => (
            <div key={s.label} className="flex flex-col items-center py-4 px-2">
              <span className="text-xl mb-1">{s.icon}</span>
              {s.value === undefined ? (
                <div className="w-8 h-7 rounded-lg bg-white/20 animate-pulse mb-1" />
              ) : (
                <span className="font-display font-extrabold text-3xl leading-none" style={{ color: s.color ? '#FCA5A5' : '#fff' }}>{s.value}</span>
              )}
              <span className="text-[10px] font-semibold opacity-70 mt-1.5 text-center">{s.label}</span>
            </div>
          ))}
        </div>
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

        {/* Display row */}
        <div className="flex items-center gap-2 mb-3">
          {activeClassName && activeTermName ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="inline-flex items-center h-8 px-3 rounded-full bg-accent text-white text-sm font-bold">{activeClassName}</span>
              <span className="text-muted text-sm">·</span>
              <span className="inline-flex items-center h-8 px-3 rounded-full bg-accent/15 text-accent-ink text-sm font-bold">{activeTermName}</span>
            </div>
          ) : (
            <div className="flex-1 text-sm text-status-overdue font-semibold">⚠ ยังไม่ได้เลือก Class / Term</div>
          )}
        </div>

        {editingClassTerm && (
          <div className="border-t border-line pt-3">
            {/* Class section */}
            <div className="mb-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Class</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {classes.map((c) => (
                  <div key={c.id} className="flex items-center gap-1">
                    {renamingClassId === c.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={renamingClassName}
                          onChange={(e) => setRenamingClassName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && renamingClassName.trim()) {
                              renameClass.mutate({ id: c.id, name: renamingClassName.trim() }, { onSuccess: () => setRenamingClassId('') });
                            } else if (e.key === 'Escape') setRenamingClassId('');
                          }}
                          className="h-8 w-24 px-2 text-sm rounded-lg border border-accent outline-none text-center font-bold"
                        />
                        <button onClick={() => { if (renamingClassName.trim()) renameClass.mutate({ id: c.id, name: renamingClassName.trim() }, { onSuccess: () => setRenamingClassId('') }); }}
                          className="h-8 px-2 rounded-lg bg-accent text-white text-xs font-bold">✓</button>
                        <button onClick={() => setRenamingClassId('')}
                          className="h-8 px-2 rounded-lg border border-line text-xs text-muted">✕</button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveClassId(c.id)}
                          className={`h-9 px-4 rounded-full text-sm font-bold transition ${c.id === activeClassId ? 'bg-accent text-white shadow-sm' : 'bg-bg text-ink border border-line hover:border-accent'}`}>
                          {c.name}
                        </button>
                        <button
                          onClick={() => { setRenamingClassId(c.id); setRenamingClassName(c.name); }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-faint hover:text-accent hover:bg-accent/10 transition"
                          title="Rename class">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {c.id !== activeClassId && (
                          <button
                            onClick={() => deleteClass.mutate(c.id)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-faint hover:text-status-overdue hover:bg-status-overdue/10 transition"
                            title="Delete class">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Add new class */}
              <div className="flex gap-2">
                <input
                  value={newClassName}
                  onChange={(e) => { setNewClassName(e.target.value); setClassErr(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                  placeholder="e.g. M.4"
                  className="flex-1 h-9 rounded-xl border border-line px-3 text-sm outline-none focus:border-accent" />
                <Button className="h-9 px-3 text-xs flex-none" onClick={handleAddClass} disabled={!newClassName.trim()}>
                  + Add
                </Button>
              </div>
              {classErr && <div className="text-status-overdue text-xs mt-1">{classErr}</div>}
            </div>

            {/* Term section */}
            <div className="mb-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Term</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {terms.map((t) => (
                  <div key={t.id} className="flex items-center gap-1">
                    {renamingTermId === t.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={renamingTermName}
                          onChange={(e) => setRenamingTermName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && renamingTermName.trim()) {
                              renameTerm.mutate({ id: t.id, name: renamingTermName.trim() }, { onSuccess: () => setRenamingTermId('') });
                            } else if (e.key === 'Escape') setRenamingTermId('');
                          }}
                          className="h-8 w-24 px-2 text-sm rounded-lg border border-accent outline-none text-center font-bold"
                        />
                        <button onClick={() => { if (renamingTermName.trim()) renameTerm.mutate({ id: t.id, name: renamingTermName.trim() }, { onSuccess: () => setRenamingTermId('') }); }}
                          className="h-8 px-2 rounded-lg bg-accent text-white text-xs font-bold">✓</button>
                        <button onClick={() => setRenamingTermId('')}
                          className="h-8 px-2 rounded-lg border border-line text-xs text-muted">✕</button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveTermId(t.id)}
                          className={`h-9 px-4 rounded-full text-sm font-bold transition ${t.id === activeTermId ? 'bg-accent/15 text-accent-ink border border-accent' : 'bg-bg text-ink border border-line hover:border-accent'}`}>
                          {t.name}
                        </button>
                        <button
                          onClick={() => { setRenamingTermId(t.id); setRenamingTermName(t.name); }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-faint hover:text-accent hover:bg-accent/10 transition"
                          title="Rename term">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {t.id !== activeTermId && (
                          <button
                            onClick={() => deleteTerm.mutate(t.id)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-faint hover:text-status-overdue hover:bg-status-overdue/10 transition"
                            title="Delete term">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Add new term */}
              <div className="flex gap-2">
                <input
                  value={newTermName}
                  onChange={(e) => { setNewTermName(e.target.value); setTermErr(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                  placeholder="e.g. Term 2"
                  className="flex-1 h-9 rounded-xl border border-line px-3 text-sm outline-none focus:border-accent" />
                <Button className="h-9 px-3 text-xs flex-none" onClick={handleAddTerm} disabled={!newTermName.trim()}>
                  + Add
                </Button>
              </div>
              {termErr && <div className="text-status-overdue text-xs mt-1">{termErr}</div>}
            </div>

            <Button className="w-full h-9 text-sm" onClick={() => setEditingClassTerm(false)}>Done</Button>
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
                        {m.shortName?.toUpperCase() || m.name.slice(0, 2).toUpperCase()}
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
            <input value={editingSubject.short} onChange={(e) => setEditingSubject({ ...editingSubject, short: e.target.value.toUpperCase().slice(0, 3) })}
              placeholder="Short code (e.g. ELS)" maxLength={3}
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
              <Button variant="danger" className="h-7 px-2 text-xs" onClick={() => deleteSubject.mutate(s.id)}>Del</Button>
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
            <select value={editingTeacher.subject} onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
              className="w-full h-9 rounded-lg border border-line px-3 text-xs mt-0.5 mb-2 outline-none focus:border-accent">
              <option value="">— select subject —</option>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            <label className="text-[11px] text-muted">Class</label>
            <select value={editingTeacher.className} onChange={(e) => setEditingTeacher({ ...editingTeacher, className: e.target.value })}
              className="w-full h-9 rounded-lg border border-line px-3 text-xs mt-0.5 mb-2 outline-none focus:border-accent">
              <option value="">— select class —</option>
              {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                <Button variant="danger" className="h-7 px-2 text-xs" onClick={() => deleteTeacher.mutate(t.id)}>Del</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
