import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressStatus } from '@homework-tracker/shared-types';
import { useActiveClassTerm } from '../hooks/useOversight';
import { useAuth } from '../context/AuthContext';
import { useProgress, useUpdateProgress } from '../hooks/useProgress';
import { computeDueState, STATUS_LABEL } from '../lib/dueState';
import { SubjectBadge, DueChip } from '../components/ui';
import { useT } from '../i18n';
import { subjectColor, subjectShort } from '../lib/subjects';

type Filter = 'todo' | 'near' | 'overdue' | 'submitted';

export function DashboardPage() {
  const { user } = useAuth();
  const { activeClassName, activeTermName } = useActiveClassTerm();
  const navigate = useNavigate();
  const { t } = useT();

  const isChild = user?.roles.includes('child') ?? false;

  const [activeChildId, setActiveChildId] = useState<string | undefined>(
    isChild ? user?.userId : undefined,
  );
  const [filter, setFilter] = useState<Filter>('todo');

  const { data: progressRows = [], isLoading } = useProgress(
    activeChildId,
    activeClassName,
    activeTermName,
  );

  const updateProgress = useUpdateProgress();

  async function handleCycleStatus(row: { progressId: string | null; assignmentId: string; status: ProgressStatus }) {
    const next: Record<ProgressStatus, ProgressStatus> = {
      not_started: ProgressStatus.Done,
      done: ProgressStatus.Submitted,
      submitted: ProgressStatus.NotStarted,
    };
    await updateProgress.mutateAsync({
      assignmentId: row.assignmentId,
      progressId: row.progressId,
      childId: activeChildId,
      status: next[row.status],
    });
  }

  const rows = useMemo(() =>
    progressRows.map((p) => ({ p, due: computeDueState(p.dueDate, p.status) })),
    [progressRows],
  );

  const total     = rows.length;
  const submitted = rows.filter((r) => r.p.status === ProgressStatus.Submitted).length;
  const doneOrSub = rows.filter((r) => r.p.status !== ProgressStatus.NotStarted).length;
  const todo      = rows.filter((r) => r.p.status === ProgressStatus.NotStarted).length;
  const overdue   = rows.filter((r) => r.due === 'overdue').length;
  const pct = total ? Math.round((doneOrSub / total) * 100) : 0;

  const R = 29;
  const CIRC = 2 * Math.PI * R;
  const ringDash = `${(pct / 100) * CIRC} ${CIRC}`;

  const filtered = rows.filter((r) => {
    if (filter === 'todo') return r.p.status !== ProgressStatus.Submitted;
    if (filter === 'near') return r.due === 'due_today' || r.due === 'near';
    if (filter === 'overdue') return r.due === 'overdue';
    return r.p.status === ProgressStatus.Submitted;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: 'todo',      label: 'To do' },
    { key: 'near',      label: 'Near due' },
    { key: 'overdue',   label: 'Overdue' },
    { key: 'submitted', label: 'Submitted' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* progress ring */}
      <div className="rounded-[22px] p-5 text-white flex items-center gap-5" style={{ background: 'linear-gradient(140deg,#5B53E0 0%,#7A5AF0 100%)', boxShadow: '0 18px 34px -16px rgba(91,83,224,.7)' }}>
        <div className="relative w-[70px] h-[70px] flex-none">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r={R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="8" />
            <circle cx="35" cy="35" r={R} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={ringDash} transform="rotate(-90 35 35)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-extrabold text-xl leading-none">{pct}</span>
            <span className="text-[9px] opacity-85 -mt-0.5">%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm opacity-90 font-semibold">
            {isChild ? 'My homework' : `Homework · ${activeClassName} ${activeTermName}`}
          </div>
          <div className="font-display font-bold text-lg mt-0.5">Submitted {submitted}/{total}</div>
          <div className="flex gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFC56B' }} />{todo} to do
            </span>
            {overdue > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF9A8B' }} />{overdue} overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* filter chips */}
      <div className="flex gap-2 my-4">
        {chips.map((ch) => (
          <button key={ch.key} onClick={() => setFilter(ch.key)}
            className={`h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${filter === ch.key ? 'bg-ink text-white' : 'bg-white border border-line text-muted'}`}>
            {ch.label}
          </button>
        ))}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-faint text-sm">
          {total === 0
            ? <><div>No assignments for <span className="font-semibold text-accent-ink">{activeClassName} · {activeTermName}</span></div><div className="mt-1 text-[11px]">Admin → Settings to change active class/term</div></>
            : 'Nothing here 🎉'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(({ p, due }) => {
            const sc = subjectColor(p.subject);
            const sh = subjectShort(p.subject);
            const dateStr = new Date(p.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const dueChipCls = due === 'overdue' ? 'bg-status-overdue text-white' : due === 'due_today' ? 'bg-[#EBA53A] text-white' : due === 'near' ? 'bg-status-done/30 text-[#8A5D0E]' : '';
            const dueChipLabel = due === 'overdue' ? 'Overdue' : due === 'due_today' ? 'Due today' : due === 'near' ? 'Near due' : '';
            const STATUS_PILL: Record<ProgressStatus, { cls: string; dot: string }> = {
              not_started: { cls: 'bg-status-notstarted/30 text-ink', dot: 'bg-status-notstarted' },
              done:        { cls: 'bg-status-done/20 text-[#8A5D0E]', dot: 'bg-status-done' },
              submitted:   { cls: 'bg-status-submitted/15 text-[#1F7D52]', dot: 'bg-status-submitted' },
            };
            const pill = STATUS_PILL[p.status];
            return (
              <button key={p.assignmentId} onClick={() => navigate(`/assignment/${p.assignmentId}`)}
                className="bg-white border border-line rounded-[18px] px-4 py-4 flex items-start gap-3 shadow-[0_1px_3px_rgba(28,27,41,.06)] text-left w-full active:scale-[.99] transition">
                <div className="flex flex-col items-center gap-1.5 flex-none w-11">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl font-display font-extrabold text-sm" style={{ background: sc.bg, color: sc.fg }}>{sh}</span>
                  <span className="text-[11px] text-faint font-semibold whitespace-nowrap">{dateStr}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[15px] text-ink leading-snug line-clamp-2 flex-1">{p.topic}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B99AD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-none mt-0.5"><path d="m9 18 6-6-6-6" /></svg>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-xs text-muted">{p.className} · {p.teacherName}</span>
                    {dueChipLabel && <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-none ${dueChipCls}`}>{dueChipLabel}</span>}
                  </div>
                  <div className="mt-2">
                    <button onClick={(e) => { e.stopPropagation(); handleCycleStatus(p); }}
                      className={`inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-bold transition active:scale-95 ${pill.cls}`}>
                      <span className={`w-2 h-2 rounded-full ${pill.dot}`} />
                      {STATUS_LABEL[p.status]}
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
