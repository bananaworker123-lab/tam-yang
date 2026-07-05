import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProgressStatus } from '@homework-tracker/shared-types';
import { useAuth } from '../context/AuthContext';
import { useProgress, useUpdateProgress } from '../hooks/useProgress';
import { computeDueState } from '../lib/dueState';
import { StatusSegment, StatusBanner } from '../components/ui';
import { subjectColor } from '../lib/subjects';
import { useT } from '../i18n';

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-3.5">
      <div className="text-[11px] text-faint font-bold uppercase tracking-wide">{label}</div>
      <div className="font-bold text-[14.5px] text-ink mt-1">{value}</div>
    </div>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useT();
  const isChild = user?.roles.includes('child') ?? false;
  const isTeacher = user?.roles.includes('teacher') ?? false;
  const childId = isChild ? user?.userId : undefined;

  const { data: progressRows = [], isLoading } = useProgress(childId, id);
  const updateProgress = useUpdateProgress();

  const p = progressRows.find((x) => x.assignmentId === id);

  const [localStatus, setLocalStatus] = useState<ProgressStatus | null>(null);
  useEffect(() => { if (p) setLocalStatus(p.status); }, [p?.status]);

  const pendingStatus = localStatus ?? p?.status;
  const isDirty = pendingStatus !== p?.status;

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );

  if (!p) return <StatusBanner kind="error">{t('detail.notFoundFull')}</StatusBanner>;

  const due = computeDueState(p.dueDate, p.status);
  const sc = subjectColor(p.subject);
  const sh = p.subjectShort;

  const dueChipCls = due === 'overdue' ? 'bg-status-overdue text-white' : due === 'due_today' ? 'bg-[#EBA53A] text-white' : due === 'near' ? 'bg-status-done/30 text-[#8A5D0E]' : 'bg-bg text-muted';
  const dueChipLabel = due === 'overdue' ? `${t('detail.dueOverdue')} ${fmtDate(p.dueDate)}` : due === 'due_today' ? `${t('detail.dueToday')} ${fmtDate(p.dueDate)}` : due === 'near' ? `${t('detail.dueSoon')} ${fmtDate(p.dueDate)}` : p.status === ProgressStatus.Submitted ? t('detail.submittedCheck') : `${t('detail.dueOn')} ${fmtDate(p.dueDate)}`;

  async function handleSave() {
    if (!pendingStatus || !p) return;
    await updateProgress.mutateAsync({ assignmentId: p.assignmentId, progressId: p.progressId, childId, status: pendingStatus });
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-muted text-sm mb-4 inline-flex items-center gap-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        {t('detail.back')}
      </button>

      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl font-display font-extrabold text-base flex-none" style={{ background: sc.bg, color: sc.fg }}>{sh}</span>
        <div>
          <div className="font-bold text-sm text-ink">{p.subject}</div>
          <div className="text-xs text-muted">{p.teacherName}</div>
        </div>
      </div>

      <h1 className="font-display font-bold text-2xl text-ink leading-snug mb-3">{p.topic}</h1>

      <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold mb-5 ${dueChipCls}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
        {dueChipLabel}
      </span>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <InfoBox label={t('detail.assigned')} value={fmtDate(p.assignedDate)} />
        <InfoBox label={t('detail.due')} value={fmtDate(p.dueDate)} />
        <InfoBox label={t('detail.class')} value={p.className} />
        <InfoBox label={t('detail.term')} value={p.term} />
      </div>

      <div className="bg-white border border-line rounded-[18px] p-4">
        <div className="font-bold text-[14.5px] text-ink mb-3">{t('detail.statusHeading')}</div>
        {isTeacher ? (
          <div className="text-sm text-muted bg-bg rounded-xl px-3 py-3">{t('detail.readonlyFull')}</div>
        ) : (
          <>
            <StatusSegment value={pendingStatus ?? p.status} onChange={setLocalStatus} disabled={updateProgress.isPending} />
            <button
              onClick={handleSave}
              disabled={!isDirty || updateProgress.isPending}
              className="mt-3 w-full h-11 rounded-xl bg-accent text-white text-sm font-bold transition disabled:opacity-40 active:scale-[.98]">
              {updateProgress.isPending ? t('detail.saving') : t('detail.save')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
