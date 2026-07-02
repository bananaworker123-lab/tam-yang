import { useAdminFamilies } from '../../hooks/useOversight';
import { Card, Avatar, PageHeader, EmptyState } from '../../components/ui';

export function AdminFamiliesPage() {
  const { data: families = [], isLoading } = useAdminFamilies();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  if (families.length === 0) return (
    <div>
      <div className="font-display font-bold text-ink text-xl mb-4">All families</div>
      <EmptyState title="No families yet" />
    </div>
  );

  return (
    <div>
      <PageHeader kicker="Admin" title="All families" />
      <div className="flex flex-col gap-3">
        {families.map((f) => (
          <Card key={f.id}>
            <div className="flex items-center justify-between">
              <div className="font-display font-bold text-ink">{f.name}</div>
              <div className="text-xs text-faint">{f.members.length} members</div>
            </div>
            <div className="h-px bg-line my-3" />
            <div className="flex flex-col gap-2">
              {f.members.map((m) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <Avatar initials={m.name.slice(0, 2).toUpperCase()} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-ink">{m.name}</span>
                    <div className="text-xs text-faint">{m.email}</div>
                  </div>
                  <span className="text-xs text-faint">{m.role === 'parent' ? 'Parent' : 'Child'}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
