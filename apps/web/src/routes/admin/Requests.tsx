import { useState } from 'react';
import { useAllRequests, useResolveRequest, useRejectRequest } from '../../hooks/useRequests';
import { Card, Button, PageHeader, EmptyState } from '../../components/ui';

export function AdminRequestsPage() {
  const { data: requests = [], isLoading } = useAllRequests();
  const resolveRequest = useResolveRequest();
  const rejectRequest  = useRejectRequest();
  const [replies, setReplies] = useState<Record<string, string>>({});

  if (isLoading && !requests.length) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader kicker="Admin" title="Manage requests" />
      {requests.length === 0 ? (
        <EmptyState title="No requests" />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-accent-ink">{r.role}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'bg-status-done/25 text-[#8A5D0E]' : r.status === 'resolved' ? 'bg-status-submitted/15 text-[#1F7D52]' : 'bg-status-overdue/15 text-status-overdue'}`}>
                  {r.status === 'pending' ? 'Pending' : r.status === 'resolved' ? 'Resolved' : 'Rejected'}
                </span>
              </div>
              <div className="text-sm text-ink mt-2">{r.detail}</div>
              <div className="text-xs text-faint mt-1">{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>

              {r.status === 'pending' ? (
                <div className="mt-3">
                  <textarea
                    value={replies[r.id] ?? ''}
                    onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })}
                    rows={2}
                    placeholder="Write a reply…"
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="danger" className="flex-1 h-10"
                      onClick={() => rejectRequest.mutate({ id: r.id, reply: replies[r.id] })}
                      disabled={rejectRequest.isPending}>
                      Reject
                    </Button>
                    <Button className="flex-1 h-10"
                      onClick={() => resolveRequest.mutate({ id: r.id, reply: replies[r.id] ?? '' })}
                      disabled={resolveRequest.isPending}>
                      Approve
                    </Button>
                  </div>
                </div>
              ) : r.reply ? (
                <div className="mt-2 bg-bg rounded-xl px-3 py-2 border-l-2 border-accent">
                  <div className="text-[10px] font-bold text-faint uppercase">Reply</div>
                  <div className="text-sm text-ink">{r.reply}</div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
