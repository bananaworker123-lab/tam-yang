import { useState } from 'react';
import { useAuditLog } from '../../hooks/useOversight';
import { STATUS_LABEL } from '../../lib/dueState';
import { Card, PageHeader, EmptyState, SkeletonCard } from '../../components/ui';
import type { ProgressStatus } from '@homework-tracker/shared-types';

export function AdminAuditPage() {
  const [q, setQ] = useState('');
  const { data: entries = [], isLoading } = useAuditLog(q || undefined);

  return (
    <div>
      <PageHeader kicker="Admin" title="Audit log" sub="Every status change is recorded" />
      <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-3 h-11 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B99AD" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (user ID / assignment ID)…" className="flex-1 text-sm outline-none" />
      </div>

      {isLoading && entries.length === 0 ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : entries.length === 0 ? (
        <EmptyState title="No matching entries" />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink truncate max-w-[55%]">{e.actorUserId.slice(0, 8)}… <span className="text-xs text-faint font-semibold">· {e.actorRole}</span></span>
                <span className="text-xs text-faint">{new Date(e.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="text-xs text-muted mt-1 truncate">child: {e.childUserId.slice(0, 8)}…</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="bg-bg text-faint rounded px-2 py-0.5 font-semibold">{STATUS_LABEL[e.fromStatus as ProgressStatus] ?? e.fromStatus}</span>
                <span className="text-faint">→</span>
                <span className="bg-status-submitted/15 text-[#1F7D52] rounded px-2 py-0.5 font-semibold">{STATUS_LABEL[e.toStatus as ProgressStatus] ?? e.toStatus}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
