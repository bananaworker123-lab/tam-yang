import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressStatus } from '@homework-tracker/shared-types';
import { useActiveClassTerm } from '../hooks/useOversight';
import { useAuth } from '../context/AuthContext';
import { useProgress, useUpdateProgress } from '../hooks/useProgress';
import { computeDueState, STATUS_LABEL } from '../lib/dueState';
import { SubjectBadge, DueChip, SkeletonCard } from '../components/ui';
import { useT } from '../i18n';
import { subjectColor, subjectShort } from '../lib/subjects';

type Filter = 'todo' | 'near' | 'overdue' | 'submitted';

export function DashboardPage() {
  const { user } = useAuth();
  const { activeClassName, activeTermName, isLoading: classTermLoading } = useActiveClassTerm();
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
      not_started: ProgressStatus.WorkingOn,
      working_on: ProgressStatus.Done,
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

  const total      = rows.length;
  const submitted  = rows.filter((r) => r.p.status === ProgressStatus.Submitted).length;
  const doneOrSub  = rows.filter((r) => r.p.status !== ProgressStatus.NotStarted).length;
  const notStarted = rows.filter((r) => r.p.status === ProgressStatus.NotStarted).length;
  const workingOn  = rows.filter((r) => r.p.status === ProgressStatus.WorkingOn).length;
  const todo       = rows.filter((r) => r.p.status !== ProgressStatus.Submitted).length;
  const overdue    = rows.filter((r) => r.due === 'overdue' && r.p.status !== ProgressStatus.Submitted).length;
  const pct = total ? Math.round((submitted / total) * 100) : 0;

  const R = 34;
  const CIRC = 2 * Math.PI * R;
  const ringDash = `${(pct / 100) * CIRC} ${CIRC}`;

  const filtered = rows.filter((r) => {
    if (filter === 'todo') return r.p.status !== ProgressStatus.Submitted;
    if (filter === 'near') return (r.due === 'due_today' || r.due === 'near') && r.p.status !== ProgressStatus.Submitted;
    if (filter === 'overdue') return r.due === 'overdue' && r.p.status !== ProgressStatus.Submitted;
    return r.p.status === ProgressStatus.Submitted;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: 'todo',      label: t('dash.filter.todo') },
    { key: 'near',      label: t('dash.filter.near') },
    { key: 'overdue',   label: t('dash.filter.overdue') },
    { key: 'submitted', label: t('dash.filter.submitted') },
  ];

  const showSkeleton = classTermLoading || (isLoading && progressRows.length === 0);

  return (
    <div>
      {/* progress header */}
      <div className="rounded-[22px] text-white overflow-hidden" style={{ background: 'linear-gradient(140deg,#5B53E0 0%,#7A5AF0 100%)', boxShadow: '0 18px 34px -16px rgba(91,83,224,.7)' }}>
        {/* Top row: ring + title */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4">
          <div className="relative w-[80px] h-[80px] flex-none">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="9" />
              <circle cx="40" cy="40" r={R} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray={ringDash} transform="rotate(-90 40 40)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-extrabold text-xl leading-none">{pct}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs opacity-75 font-semibold uppercase tracking-widest">
              {isChild ? t('dash.myHomeworkLabel') : `${activeClassName} · ${activeTermName}`}
            </div>
            <div className="font-display font-extrabold text-2xl mt-0.5">{submitted}<span className="text-base font-semibold opacity-70">/{total}</span></div>
            <div className="text-xs opacity-75 font-semibold">{t('dash.submittedOf2')}</div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-4 border-t border-white/15">
          {[
            { label: t('dash.todo'),         count: todo,       accent: '#FB923C' },
            { label: t('dash.notStarted'),   count: notStarted, accent: '#CBD5E1' },
            { label: t('dash.workingOn'),    count: workingOn,  accent: '#38BDF8' },
            { label: t('dash.overdueCount'), count: overdue,    accent: '#F87171' },
          ].map(({ label, count, accent }, i) => (
            <div key={label} className={`flex flex-col items-center py-3 px-1 ${i < 3 ? 'border-r border-white/15' : ''}`}>
              <span className="font-display font-extrabold text-2xl leading-none">{count}</span>
              <span className="text-[10px] font-semibold opacity-70 mt-1 text-center leading-tight">{label}</span>
              <div className="w-8 h-1 rounded-full mt-2" style={{ background: accent }} />
            </div>
          ))}
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
      {showSkeleton ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-faint text-sm">
          {total === 0
            ? <><div>{t('dash.noAssignments')} <span className="font-semibold text-accent-ink">{activeClassName} · {activeTermName}</span></div><div className="mt-1 text-[11px]">{t('dash.noAssignmentsHint')}</div></>
            : t('dash.nothingHere')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(({ p, due }) => {
            const sc = subjectColor(p.subject);
            const sh = subjectShort(p.subject);
            const dateStr = new Date(p.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const dueChipCls = due === 'overdue' ? 'bg-status-overdue text-white' : due === 'due_today' ? 'bg-[#EBA53A] text-white' : due === 'near' ? 'bg-status-done/30 text-[#8A5D0E]' : '';
            const dueChipLabel = due === 'overdue' ? t('due.overdue') : due === 'due_today' ? t('due.today') : due === 'near' ? t('due.near') : '';
            const STATUS_PILL: Record<ProgressStatus, { cls: string; dot: string }> = {
              not_started: { cls: 'bg-status-notstarted/30 text-ink', dot: 'bg-status-notstarted' },
              working_on:  { cls: 'bg-[#7EC8E3]/20 text-[#1A6B8A]', dot: 'bg-[#7EC8E3]' },
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
                      {t(`status.${p.status}`)}
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
