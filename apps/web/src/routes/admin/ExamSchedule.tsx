import { useState } from 'react';
import { useT } from '../../i18n';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam, type ExamEvent } from '../../hooks/useExam';
import { Card, PageHeader, EmptyState, SkeletonCard, Button } from '../../components/ui';

const EXAM_TYPE_VALUES = ['midterm', 'final', 'out_of_schedule', 'competition'];

const TYPE_COLOR: Record<string, string> = {
  midterm:         'bg-blue-100 text-blue-700',
  final:           'bg-purple-100 text-purple-700',
  out_of_schedule: 'bg-orange-100 text-orange-700',
  competition:     'bg-rose-100 text-rose-700',
};

const EMPTY: Partial<ExamEvent> = {
  examType: 'midterm', subject: '', examDate: '', examTime: '', endTime: '',
  location: '', isOpenWindow: false, registrationDeadline: '', announcementDate: '', admitCardDate: '',
};

function ExamForm({ initial, onSave, onCancel, saving }: {
  initial: Partial<ExamEvent>;
  onSave: (v: Partial<ExamEvent>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const { t } = useT();
  const [v, setV] = useState<Partial<ExamEvent>>(initial);
  const set = (k: keyof ExamEvent, val: unknown) => setV((p) => ({ ...p, [k]: val }));
  const isCompetition = v.examType === 'competition';

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.type')}</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {EXAM_TYPE_VALUES.map((value) => (
            <button key={value} onClick={() => set('examType', value)}
              className={`h-9 rounded-xl text-xs font-bold border transition ${v.examType === value ? 'bg-accent text-white border-accent' : 'bg-bg text-muted border-line hover:border-accent'}`}>
              {t('exam.type.' + value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.subject')}</label>
        <input value={v.subject ?? ''} onChange={(e) => set('subject', e.target.value)}
          className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
          placeholder={t('exam.form.subjectPlaceholder')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.examDate')}</label>
          <input type="date" value={v.examDate ?? ''} onChange={(e) => set('examDate', e.target.value)}
            className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.startTime')}</label>
          <input type="time" value={v.examTime ?? ''} onChange={(e) => set('examTime', e.target.value)}
            className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.endTime')}</label>
          <input type="time" value={v.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)}
            className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.location')}</label>
          <input value={v.location ?? ''} onChange={(e) => set('location', e.target.value)}
            className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
            placeholder={t('exam.form.locationPlaceholder')} />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={v.isOpenWindow ?? false} onChange={(e) => set('isOpenWindow', e.target.checked)} className="accent-accent w-4 h-4" />
        <span className="text-sm text-ink">{t('exam.form.openWindow')}</span>
      </label>

      {isCompetition && (
        <div className="border-t border-line pt-3 flex flex-col gap-3">
          <div className="text-xs font-extrabold text-faint uppercase tracking-wider">{t('exam.form.compTitle')}</div>
          <div>
            <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.regDeadline')}</label>
            <input type="date" value={v.registrationDeadline ?? ''} onChange={(e) => set('registrationDeadline', e.target.value)}
              className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.announcement')}</label>
              <input type="date" value={v.announcementDate ?? ''} onChange={(e) => set('announcementDate', e.target.value)}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.admitCard')}</label>
              <input type="date" value={v.admitCardDate ?? ''} onChange={(e) => set('admitCardDate', e.target.value)}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>{t('exam.form.cancel')}</Button>
        <Button className="flex-1" onClick={() => onSave(v)} disabled={saving || !v.subject?.trim() || !v.examDate}>
          {saving ? t('exam.form.saving') : t('exam.form.save')}
        </Button>
      </div>
    </div>
  );
}

export function AdminExamSchedulePage() {
  const { t, locale } = useT();
  const { data: exams = [], isLoading } = useExams();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dtLocale = locale === 'th' ? 'th-TH' : 'en-GB';

  async function handleCreate(v: Partial<ExamEvent>) {
    await createExam.mutateAsync(v);
    setShowCreate(false);
  }

  async function handleUpdate(v: Partial<ExamEvent>) {
    if (!editId) return;
    await updateExam.mutateAsync({ id: editId, ...v });
    setEditId(null);
  }

  async function handleDelete(id: string) {
    await deleteExam.mutateAsync(id);
    setDeleteId(null);
  }

  return (
    <div>
      <PageHeader kicker="Admin" title={t('exam.title')} sub={t('exam.admin.sub')} />

      {!showCreate && (
        <Button variant="ghost" className="w-full mb-4 border-dashed" onClick={() => setShowCreate(true)}>
          {t('exam.admin.addBtn')}
        </Button>
      )}

      {showCreate && (
        <Card className="mb-4">
          <div className="text-sm font-bold text-ink mb-3">{t('exam.admin.createTitle')}</div>
          <ExamForm initial={EMPTY} onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={createExam.isPending} />
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : exams.length === 0 ? (
        <EmptyState title={t('exam.empty')} />
      ) : (
        <div className="flex flex-col gap-2">
          {exams.map((e) => {
            if (editId === e.id) {
              return (
                <Card key={e.id}>
                  <div className="text-sm font-bold text-ink mb-3">{t('exam.admin.editTitle')}</div>
                  <ExamForm initial={e} onSave={handleUpdate} onCancel={() => setEditId(null)} saving={updateExam.isPending} />
                </Card>
              );
            }
            return (
              <Card key={e.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[e.examType] ?? 'bg-bg text-faint'}`}>
                        {t('exam.type.' + e.examType)}
                      </span>
                      {e.isOpenWindow && <span className="text-[11px] text-faint">{t('exam.admin.openWindow')}</span>}
                    </div>
                    <div className="font-bold text-[15px] text-ink">{e.subject}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {new Date(e.examDate + 'T00:00:00').toLocaleDateString(dtLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
                      {e.examTime && <span> · {e.examTime}{e.endTime ? `–${e.endTime}` : ''}</span>}
                      {e.location && <span> · {e.location}</span>}
                    </div>
                    {e.examType === 'competition' && (
                      <div className="mt-1 text-xs text-faint flex flex-wrap gap-x-3">
                        {e.registrationDeadline && <span>{t('exam.comp.registration')} {new Date(e.registrationDeadline + 'T00:00:00').toLocaleDateString(dtLocale, { day: 'numeric', month: 'short' })}</span>}
                        {e.announcementDate     && <span>{t('exam.comp.announcement')} {new Date(e.announcementDate + 'T00:00:00').toLocaleDateString(dtLocale, { day: 'numeric', month: 'short' })}</span>}
                        {e.admitCardDate        && <span>{t('exam.comp.admitCard')} {new Date(e.admitCardDate + 'T00:00:00').toLocaleDateString(dtLocale, { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-none">
                    <button onClick={() => setEditId(e.id)} className="text-xs text-accent font-semibold px-2 py-1 rounded-lg hover:bg-accent/10 transition">{t('exam.admin.edit')}</button>
                    <button onClick={() => setDeleteId(e.id)} className="text-xs text-status-overdue font-semibold px-2 py-1 rounded-lg hover:bg-status-overdue/10 transition">{t('exam.admin.delete')}</button>
                  </div>
                </div>

                {deleteId === e.id && (
                  <div className="mt-3 pt-3 border-t border-line">
                    <div className="text-sm text-ink mb-2">{t('exam.admin.confirmDeletePrefix')}{e.subject}{t('exam.admin.confirmDeleteSuffix')}</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>{t('exam.form.cancel')}</Button>
                      <Button variant="danger" className="flex-1" onClick={() => handleDelete(e.id)} disabled={deleteExam.isPending}>
                        {deleteExam.isPending ? t('exam.admin.deleting') : t('exam.admin.delete')}
                      </Button>
                    </div>
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
