import { useState } from 'react';
import { useAuditLog } from '../../hooks/useOversight';
import { STATUS_LABEL } from '../../lib/dueState';
import { Card, PageHeader, EmptyState, SkeletonCard } from '../../components/ui';
import type { ProgressStatus } from '@homework-tracker/shared-types';

const ACTION_LABEL: Record<string, string> = {
  assignment_created: 'เพิ่ม assignment',
  assignment_updated: 'แก้ไข assignment',
  assignment_deleted: 'ลบ assignment',
};

export function AdminAuditPage() {
  const [q, setQ] = useState('');
  const { data: entries = [], isLoading } = useAuditLog(q || undefined);

  return (
    <div>
      <PageHeader kicker="Admin" title="Audit log" sub="ทุกการเปลี่ยนแปลงถูกบันทึกไว้" />
      <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-3 h-11 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B99AD" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ, วิชา, topic…" className="flex-1 text-sm outline-none" />
      </div>

      {isLoading && entries.length === 0 ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : entries.length === 0 ? (
        <EmptyState title="No matching entries" />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e: any) => {
            const dt = new Date(e.createdAt);
            const dateStr = dt.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const isAssignmentEvent = e.eventType?.startsWith('assignment_');

            return (
              <Card key={e.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-ink truncate">
                      {e.actorName ?? '—'}
                      <span className="text-xs text-faint font-normal ml-1">· {e.actorRole}</span>
                    </div>

                    {isAssignmentEvent ? (
                      <div className="text-xs text-muted mt-0.5 truncate">
                        {ACTION_LABEL[e.eventType] ?? e.eventType}
                      </div>
                    ) : (
                      <div className="text-xs text-muted mt-0.5 truncate">
                        เปลี่ยนให้ <span className="font-semibold text-ink">{e.childName ?? '—'}</span>
                      </div>
                    )}

                    {(e.subject || e.topic) && (
                      <div className="text-xs text-faint mt-0.5 truncate">
                        {e.subject && <span className="font-semibold text-accent-ink">{e.subject}</span>}
                        {e.topic && <span>{e.subject ? ' · ' : ''}{e.topic}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-xs text-faint">{dateStr}</div>
                    <div className="text-xs text-faint">{timeStr}</div>
                  </div>
                </div>

                {!isAssignmentEvent && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="bg-bg text-faint rounded px-2 py-0.5 font-semibold">{STATUS_LABEL[e.fromStatus as ProgressStatus] ?? e.fromStatus}</span>
                    <span className="text-faint">→</span>
                    <span className="bg-status-submitted/15 text-[#1F7D52] rounded px-2 py-0.5 font-semibold">{STATUS_LABEL[e.toStatus as ProgressStatus] ?? e.toStatus}</span>
                  </div>
                )}

                {e.eventType === 'assignment_updated' && e.fromStatus !== null && e.fromStatus !== e.toStatus && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="bg-bg text-faint rounded px-2 py-0.5 font-semibold">{e.fromStatus || '—'}</span>
                    <span className="text-faint">→</span>
                    <span className="bg-status-submitted/15 text-[#1F7D52] rounded px-2 py-0.5 font-semibold">{e.toStatus || '—'}</span>
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
