import { useAdminOverview } from '../../hooks/useOversight';
import { Card, Avatar, PageHeader } from '../../components/ui';

export function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  const d = data!;
  type StatCard = { label: string; value: number; icon: string; color?: string };
  const stats: StatCard[] = [
    { label: 'Families',         value: d.familyCount,         icon: '🏠' },
    { label: 'Parents',          value: d.parentCount,         icon: '👨‍👩‍👧' },
    { label: 'Students',         value: d.childCount,          icon: '🎒' },
    { label: 'Teachers',         value: d.teacherCount,        icon: '🧑‍🏫' },
    { label: 'Active tasks',     value: d.activeAssignmentCount, icon: '📚' },
    { label: 'Pending requests', value: d.pendingRequestCount, icon: '📨', color: d.pendingRequestCount > 0 ? '#D5403F' : undefined },
  ];

  const teacherNames = [...new Set(d.assignments.map((a) => a.teacherName))];

  return (
    <div>
      <PageHeader kicker="Admin" title="Overview" />

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
                    <div className="font-semibold text-sm text-ink">{f.name}</div>
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
