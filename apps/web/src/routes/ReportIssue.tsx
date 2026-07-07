import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { useAllAssignments } from '../hooks/useAssignments';
import { useCreateRequest } from '../hooks/useRequests';
import { Card, Button, PageHeader } from '../components/ui';

type RequestType = 'homework' | 'exam';

const EXAM_TYPE_VALUES = ['midterm', 'final', 'out_of_schedule', 'competition'];

export function ReportIssuePage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { data: assignments = [] } = useAllAssignments();
  const createRequest = useCreateRequest();

  const [type, setType] = useState<RequestType | null>(null);

  // Homework fields
  const [assignmentId, setAssignmentId] = useState('');
  const [detail, setDetail] = useState('');

  // Exam fields
  const [examType,     setExamType]     = useState('midterm');
  const [subject,      setSubject]      = useState('');
  const [examDate,     setExamDate]     = useState('');
  const [examTime,     setExamTime]     = useState('');
  const [endTime,      setEndTime]      = useState('');
  const [location,     setLocation]     = useState('');
  const [isOpenWindow, setIsOpenWindow] = useState(false);
  const [regDeadline,  setRegDeadline]  = useState('');
  const [announceDate, setAnnounceDate] = useState('');
  const [admitDate,    setAdmitDate]    = useState('');
  const [examNote,     setExamNote]     = useState('');

  const [err, setErr] = useState('');

  async function submit() {
    setErr('');
    try {
      if (type === 'homework') {
        if (!detail.trim()) { setErr(t('report.err.detail')); return; }
        await createRequest.mutateAsync({ detail: detail.trim(), assignmentId: assignmentId || undefined, requestType: 'homework' });
      } else {
        if (!subject.trim() || !examDate) { setErr(t('report.err.exam')); return; }
        const examData = JSON.stringify({ examType, subject, examDate, examTime, endTime, location, isOpenWindow, registrationDeadline: regDeadline, announcementDate: announceDate, admitCardDate: admitDate, note: examNote });
        await createRequest.mutateAsync({ detail: `${t('report.exam.title')}: ${subject} (${t('exam.type.' + examType)})`, requestType: 'exam', examData });
      }
      navigate('/requests');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t('report.err.unknown'));
    }
  }

  // Step 1: choose type
  if (!type) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="text-muted text-sm mb-3">{t('report.back')}</button>
        <PageHeader title={t('report.title')} />
        <div className="flex flex-col gap-3 mt-2">
          <button onClick={() => setType('homework')}
            className="bg-white border border-line rounded-2xl px-5 py-4 text-left hover:border-accent transition flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">📚</div>
            <div>
              <div className="font-bold text-ink">{t('report.hw.type')}</div>
              <div className="text-xs text-faint mt-0.5">{t('report.hw.desc')}</div>
            </div>
          </button>
          <button onClick={() => setType('exam')}
            className="bg-white border border-line rounded-2xl px-5 py-4 text-left hover:border-accent transition flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">📝</div>
            <div>
              <div className="font-bold text-ink">{t('report.exam.type')}</div>
              <div className="text-xs text-faint mt-0.5">{t('report.exam.desc')}</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setType(null)} className="text-muted text-sm mb-3">{t('report.back')}</button>
      <PageHeader title={type === 'homework' ? t('report.hw.title') : t('report.exam.title')} />

      <Card className="mt-2">
        {type === 'homework' ? (
          <>
            <label className="text-sm font-semibold text-ink">{t('report.hw.assignLabel')}</label>
            <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 mb-3 outline-none focus:border-accent">
              <option value="">{t('report.hw.assignNone')}</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.subject} · {a.topic} ({a.dueDate})</option>
              ))}
            </select>
            <label className="text-sm font-semibold text-ink">{t('report.hw.detailLabel')}</label>
            <textarea value={detail} onChange={(e) => { setDetail(e.target.value); setErr(''); }} rows={4}
              className="w-full rounded-xl border border-line px-3 py-2 text-sm mt-1 outline-none focus:border-accent resize-none"
              placeholder={t('report.hw.detailPlaceholder')} />
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.type')}</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {EXAM_TYPE_VALUES.map((value) => (
                  <button key={value} onClick={() => setExamType(value)}
                    className={`h-9 rounded-xl text-xs font-bold border transition ${examType === value ? 'bg-accent text-white border-accent' : 'bg-bg text-muted border-line'}`}>
                    {t('exam.type.' + value)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.subject')}</label>
              <input value={subject} onChange={(e) => { setSubject(e.target.value); setErr(''); }}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
                placeholder={t('exam.form.subjectPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.examDate')}</label>
                <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); setErr(''); }}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.startTime')}</label>
                <input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.endTime')}</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-faint uppercase">{t('exam.form.location')}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
                  placeholder={t('exam.form.locationPlaceholder')} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOpenWindow} onChange={(e) => setIsOpenWindow(e.target.checked)} className="accent-accent w-4 h-4" />
              <span className="text-sm text-ink">{t('exam.form.openWindow')}</span>
            </label>
            {examType === 'competition' && (
              <div className="border-t border-line pt-3 flex flex-col gap-3">
                <div className="text-xs font-extrabold text-faint uppercase tracking-wider">{t('report.exam.compTitle')}</div>
                <div>
                  <label className="text-xs font-semibold text-faint uppercase">{t('report.exam.regDeadline')}</label>
                  <input type="date" value={regDeadline} onChange={(e) => setRegDeadline(e.target.value)}
                    className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-faint uppercase">{t('report.exam.announcement')}</label>
                    <input type="date" value={announceDate} onChange={(e) => setAnnounceDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-faint uppercase">{t('report.exam.admitCard')}</label>
                    <input type="date" value={admitDate} onChange={(e) => setAdmitDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-faint uppercase">{t('report.exam.note')}</label>
              <textarea value={examNote} onChange={(e) => setExamNote(e.target.value)} rows={2}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm mt-1 outline-none focus:border-accent resize-none"
                placeholder={t('report.exam.notePlaceholder')} />
            </div>
          </div>
        )}

        {err && <div className="text-status-overdue text-xs mt-2">{err}</div>}
        <Button className="w-full mt-3" onClick={submit} disabled={createRequest.isPending}>
          {createRequest.isPending ? t('report.submitting') : t('report.submit')}
        </Button>
      </Card>
    </div>
  );
}
