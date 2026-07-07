import { useState } from 'react';
import { useT } from '../../i18n';
import { useAllRequests, useResolveRequest, useRejectRequest } from '../../hooks/useRequests';
import { Card, Button, PageHeader, EmptyState, SkeletonCard } from '../../components/ui';

export function AdminRequestsPage() {
  const { t } = useT();
  const { data: requests = [], isLoading } = useAllRequests();
  const resolveRequest = useResolveRequest();
  const rejectRequest  = useRejectRequest();
  const [replies, setReplies] = useState<Record<string, string>>({});

  return (
    <div>
      <PageHeader kicker="Admin" title="Manage requests" />
      {isLoading && requests.length === 0 ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : requests.length === 0 ? (
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
              {r.requestType === 'exam' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mt-1 inline-block">{t('req.exam.badge')}</span>
              )}
              <div className="text-sm text-ink mt-2">{r.detail}</div>
              {r.requestType === 'exam' && r.examData && (() => {
                try {
                  const d = JSON.parse(r.examData);
                  return (
                    <div className="mt-2 bg-bg rounded-xl px-3 py-2 text-xs text-faint flex flex-col gap-0.5">
                      {d.subject  && <span><b>{t('req.exam.subject')}</b> {d.subject}</span>}
                      {d.examDate && <span><b>{t('req.exam.date')}</b> {d.examDate}</span>}
                      {d.examTime && <span><b>{t('req.exam.time')}</b> {d.examTime}{d.endTime ? `–${d.endTime}` : ''}</span>}
                      {d.location && <span><b>{t('req.exam.location')}</b> {d.location}</span>}
                      {d.registrationDeadline && <span><b>{t('req.exam.regDeadline')}</b> {d.registrationDeadline}</span>}
                      {d.announcementDate     && <span><b>{t('req.exam.announcement')}</b> {d.announcementDate}</span>}
                      {d.admitCardDate        && <span><b>{t('req.exam.admitCard')}</b> {d.admitCardDate}</span>}
                      {d.note     && <span><b>{t('req.exam.note')}</b> {d.note}</span>}
                    </div>
                  );
                } catch { return null; }
              })()}
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
