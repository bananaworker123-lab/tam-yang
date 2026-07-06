import { useState } from 'react';
import { ProgressStatus } from '@homework-tracker/shared-types';
import { useTeacherOverview, useActiveClassTerm } from '../hooks/useOversight';
import { computeDueState, STATUS_LABEL } from '../lib/dueState';
import { Card, Avatar, PageHeader } from '../components/ui';

type Filter = 'all' | 'todo' | 'overdue' | 'submitted';

export function TeacherPage() {
  const { classes, terms, activeClassName, activeTermName, setActiveClassId, setActiveTermId, activeClassId, activeTermId } = useActiveClassTerm();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading } = useTeacherOverview(activeClassName, activeTermName);

  const assignments = data?.assignments ?? [];
  const rows = data?.rows ?? [];

  function cellClass(status: string, overdue: boolean): string {
    if (status === ProgressStatus.Submitted) return 'bg-status-submitted/15 text-[#1F7D52]';
    if (overdue) return 'bg-status-overdue/15 text-status-overdue';
    if (status === ProgressStatus.Done) return 'bg-status-done/20 text-[#8A5D0E]';
    return 'bg-bg text-faint';
  }

  const initials = (name: string, short?: string | null) => short?.toUpperCase() || name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader kicker="Teacher · read-only" title="Class overview" />

      {/* class/term selectors */}
      {(classes.length > 1 || terms.length > 1) && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {classes.map((c) => (
            <button key={c.id} onClick={() => setActiveClassId(c.id)}
              className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap ${activeClassId === c.id ? 'bg-ink text-white' : 'bg-white border border-line text-muted'}`}>
              {c.name}
            </button>
          ))}
          {terms.map((t) => (
            <button key={t.id} onClick={() => setActiveTermId(t.id)}
              className={`h-8 px-3 rounded-full text-xs font-bold whitespace-nowrap ${activeTermId === t.id ? 'bg-accent text-white' : 'bg-white border border-line text-muted'}`}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'todo', 'overdue', 'submitted'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 px-3 rounded-lg text-xs font-bold ${filter === f ? 'bg-accent text-white' : 'bg-white border border-line text-muted'}`}>
            {f === 'all' ? 'All' : f === 'todo' ? 'Not started' : f === 'overdue' ? 'Overdue' : 'Submitted'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-faint text-sm">
          {!activeClassName ? 'Select a class above' : 'No data yet for this class/term'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const cells = assignments
              .map((a) => {
                const cell = r.cells.find((x) => x.assignmentId === a.id);
                const status = cell?.status ?? ProgressStatus.NotStarted;
                const overdue = computeDueState(a.dueDate, status as ProgressStatus) === 'overdue';
                return { a, status, overdue };
              })
              .filter((x) => {
                if (filter === 'all') return true;
                if (filter === 'todo') return x.status === ProgressStatus.NotStarted;
                if (filter === 'overdue') return x.overdue;
                return x.status === ProgressStatus.Submitted;
              });

            return (
              <Card key={r.childId}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={initials(r.childName, r.childShort)} />
                  <div className="font-bold text-ink text-sm">{r.childName}</div>
                </div>
                {cells.length === 0 ? (
                  <div className="text-faint text-xs">— nothing for this filter —</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cells.map((x) => (
                      <span key={x.a.id} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cellClass(x.status, x.overdue)}`}>
                        {x.a.topic || x.a.subject}: {x.overdue && x.status !== ProgressStatus.Submitted ? 'Overdue' : STATUS_LABEL[x.status as ProgressStatus]}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
