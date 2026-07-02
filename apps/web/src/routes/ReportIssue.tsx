import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllAssignments } from '../hooks/useAssignments';
import { useCreateRequest } from '../hooks/useRequests';
import { Card, Button, PageHeader, StatusBanner } from '../components/ui';

export function ReportIssuePage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { data: assignments = [] } = useAllAssignments();
  const createRequest = useCreateRequest();
  const [assignmentId, setAssignmentId] = useState(sp.get('assignment') ?? '');
  const [detail, setDetail] = useState('');
  const [err, setErr] = useState('');

  async function submit() {
    if (!detail.trim()) { setErr('Please enter details'); return; }
    try {
      await createRequest.mutateAsync({ detail: detail.trim(), assignmentId: assignmentId || undefined });
      navigate('/requests');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to submit request');
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-muted text-sm mb-3">← Back</button>
      <PageHeader title="Report an issue" />
      <StatusBanner kind="info">Sent to the admin for review. The master list is edited by admins only.</StatusBanner>
      <Card className="mt-4">
        <label className="text-sm font-semibold text-ink">Related assignment</label>
        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 mb-3 outline-none focus:border-accent"
        >
          <option value="">— None —</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.subject} · {a.topic} ({a.dueDate})</option>
          ))}
        </select>
        <label className="text-sm font-semibold text-ink">Details</label>
        <textarea
          value={detail}
          onChange={(e) => { setDetail(e.target.value); setErr(''); }}
          rows={4}
          className="w-full rounded-xl border border-line px-3 py-2 text-sm mt-1 outline-none focus:border-accent resize-none"
          placeholder="Describe what needs to be fixed…"
        />
        {err ? <div className="text-status-overdue text-xs mt-1">{err}</div> : null}
        <Button className="w-full mt-3" onClick={submit} disabled={createRequest.isPending}>
          {createRequest.isPending ? 'Submitting…' : 'Submit request'}
        </Button>
      </Card>
    </div>
  );
}
