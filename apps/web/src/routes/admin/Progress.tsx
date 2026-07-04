import { useState } from 'react';
import { ProgressStatus } from '@homework-tracker/shared-types';
import { useAdminAllProgress, useActiveClassTerm } from '../../hooks/useOversight';
import { computeDueState, STATUS_LABEL } from '../../lib/dueState';
import { Card, Avatar, PageHeader, SkeletonCard } from '../../components/ui';

type Filter = 'all' | 'not_started' | 'working_on' | 'overdue' | 'submitted';

export function AdminProgressPage() {
  const { classes, terms, activeClassId, activeTermId, activeClassName, activeTermName, setActiveClassId, setActiveTermId } = useActiveClassTerm();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading } = useAdminAllProgress(activeClassName, activeTermName);

  const assignments = data?.assignments ?? [];
  const rows        = data?.rows ?? [];

  const initials = (name: string, short?: string | null) => short?.toUpperCase() || name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader kicker="Admin" title="All progress" />

      {/* class/term selectors */}
      {(classes.length > 0 || terms.length > 0) && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {classes.map((c) => (
            <button key={c.id} onClick={() => setActiveClassId(c.id)}
              className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap flex-none ${activeClassId === c.id ? 'bg-ink text-white' : 'bg-white border border-line text-muted'}`}>
              {c.name}
            </button>
          ))}
          {terms.map((t) => (
            <button key={t.id} onClick={() => setActiveTermId(t.id)}
              className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap flex-none ${activeTermId === t.id ? 'bg-accent text-white' : 'bg-white border border-line text-muted'}`}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}
        className="w-full h-11 rounded-xl border border-line px-3 text-sm mb-4 outline-none focus:border-accent">
        <option value="all">All statuses</option>
        <option value="not_started">Not started</option>
        <option value="working_on">Working on</option>
        <option value="overdue">Overdue</option>
        <option value="submitted">Submitted</option>
      </select>

      {isLoading && rows.length === 0 ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-faint text-sm">
          {!activeClassName ? 'Select a class above' : 'No data for this class/term'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const cells = assignments
              .map((a) => {
                const cell = r.cells.find((x) => x.assignmentId === a.id);
                const status = (cell?.status ?? 'not_started') as ProgressStatus;
                const overdue = computeDueState(a.dueDate, status) === 'overdue';
                return { a, status, overdue };
              })
              .filter((x) => {
                if (filter === 'all') return true;
                if (filter === 'not_started') return x.status === ProgressStatus.NotStarted;
                if (filter === 'working_on') return x.status === ProgressStatus.WorkingOn;
                if (filter === 'overdue') return x.overdue && x.status !== ProgressStatus.Submitted;
                return x.status === ProgressStatus.Submitted;
              });

            return (
              <Card key={r.childId}>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar initials={initials(r.childName, r.childShort)} />
                  <div>
                    <div className="font-bold text-ink text-sm">{r.childName}</div>
                    <div className="text-xs text-faint">{r.familyName}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cells.length === 0 ? <span className="text-faint text-xs">—</span> : cells.map((x) => (
                    <span key={x.a.id} className={`text-[11px] font-semibold rounded px-2 py-0.5 ${x.overdue && x.status !== ProgressStatus.Submitted ? 'bg-status-overdue/15 text-status-overdue' : x.status === ProgressStatus.Submitted ? 'bg-status-submitted/15 text-[#1F7D52]' : x.status === ProgressStatus.Done ? 'bg-status-done/20 text-[#8A5D0E]' : x.status === ProgressStatus.WorkingOn ? 'bg-[#38BDF8]/15 text-[#0369A1]' : 'bg-bg text-faint'}`}>
                      {x.a.subject}: {STATUS_LABEL[x.status]}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
