import { useNavigate } from 'react-router-dom';
import { useMyRequests } from '../hooks/useRequests';
import { Card, Button, PageHeader, EmptyState, SkeletonCard } from '../components/ui';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pending',  cls: 'bg-status-done/25 text-[#8A5D0E]' },
  resolved: { label: 'Resolved', cls: 'bg-status-submitted/15 text-[#1F7D52]' },
  rejected: { label: 'Rejected', cls: 'bg-status-overdue/15 text-status-overdue' },
};

export function RequestsPage() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useMyRequests();

  return (
    <div>
      <PageHeader title="My requests" sub="Status & admin replies" />
      <Button variant="ghost" className="w-full mb-4 border-dashed" onClick={() => navigate('/report')}>
        + New request
      </Button>
      {isLoading ? (
        <div className="flex flex-col gap-3">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => {
            const b = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending;
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-ink">{r.detail}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-none ${b.cls}`}>
                    {b.label}
                  </span>
                </div>
                <div className="text-xs text-faint mt-2">{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
                {r.status === 'resolved' && r.reply ? (
                  <div className="mt-2 bg-bg rounded-xl px-3 py-2 border-l-2 border-accent">
                    <div className="text-[10px] font-bold text-faint uppercase">Reply</div>
                    <div className="text-sm text-ink">{r.reply}</div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
