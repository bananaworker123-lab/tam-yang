import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExams, useParticipate, useUnparticipate, useCompleteExam, useUncompleteExam, type ExamEvent } from '../hooks/useExam';
import { Card, PageHeader, EmptyState, SkeletonCard } from '../components/ui';

const EXAM_TYPE_LABEL: Record<string, string> = {
  midterm:        'กลางภาค',
  final:          'ปลายภาค',
  out_of_schedule: 'นอกเวลา',
  competition:    'แข่งขัน',
};

const EXAM_TYPE_COLOR: Record<string, string> = {
  midterm:         'bg-blue-100 text-blue-700',
  final:           'bg-purple-100 text-purple-700',
  out_of_schedule: 'bg-orange-100 text-orange-700',
  competition:     'bg-rose-100 text-rose-700',
};

type View = 'calendar' | 'timeline' | 'subject';

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtShortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function daysUntil(iso: string) {
  const diff = new Date(iso + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

function ExamCard({ exam, childId, isAdmin }: { exam: ExamEvent; childId?: string; isAdmin: boolean }) {
  const participate   = useParticipate();
  const unparticipate = useUnparticipate();
  const complete      = useCompleteExam();
  const uncomplete    = useUncompleteExam();

  const days = daysUntil(exam.examDate);
  const isPast = days < 0;
  const isToday = days === 0;

  function toggleParticipate() {
    if (exam.isParticipating) unparticipate.mutate({ examId: exam.id, childId });
    else participate.mutate({ examId: exam.id, childId });
  }

  function toggleComplete() {
    if (exam.isCompleted) uncomplete.mutate({ examId: exam.id, childId });
    else complete.mutate({ examId: exam.id, childId });
  }

  return (
    <Card className={exam.isCompleted && !isAdmin ? 'opacity-60' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${EXAM_TYPE_COLOR[exam.examType] ?? 'bg-bg text-faint'}`}>
              {EXAM_TYPE_LABEL[exam.examType] ?? exam.examType}
            </span>
            {exam.isCompleted && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-status-submitted/15 text-[#1F7D52]">เสร็จแล้ว</span>
            )}
          </div>
          <div className="font-bold text-[15px] text-ink mt-1">{exam.subject}</div>
          <div className="text-xs text-muted mt-0.5">
            {fmtDate(exam.examDate)}
            {exam.examTime && <span> · {exam.examTime}{exam.endTime ? `–${exam.endTime}` : ''}</span>}
            {exam.location && <span> · {exam.location}</span>}
          </div>

          {exam.examType === 'competition' && (
            <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-faint">
              {exam.registrationDeadline && <span>สมัคร: {fmtShortDate(exam.registrationDeadline)}</span>}
              {exam.announcementDate     && <span>ประกาศผล: {fmtShortDate(exam.announcementDate)}</span>}
              {exam.admitCardDate        && <span>พิมพ์บัตร: {fmtShortDate(exam.admitCardDate)}</span>}
            </div>
          )}
        </div>

        <div className="text-right flex-none">
          {!isPast && (
            <div className={`text-xs font-bold ${isToday ? 'text-status-overdue' : days <= 3 ? 'text-[#EBA53A]' : 'text-faint'}`}>
              {isToday ? 'วันนี้' : `อีก ${days} วัน`}
            </div>
          )}
          {isPast && <div className="text-xs text-faint">ผ่านไปแล้ว</div>}
        </div>
      </div>

      {!isAdmin && (
        <div className="flex gap-2 mt-3">
          {exam.examType === 'competition' && (
            <button
              onClick={toggleParticipate}
              disabled={participate.isPending || unparticipate.isPending}
              className={`flex-1 h-9 rounded-xl text-xs font-bold border transition ${exam.isParticipating ? 'bg-accent text-white border-accent' : 'bg-bg text-muted border-line hover:border-accent hover:text-accent'}`}
            >
              {exam.isParticipating ? 'เข้าร่วมแล้ว ✓' : 'เข้าร่วม'}
            </button>
          )}
          {exam.isOpenWindow && (exam.examType !== 'competition' || exam.isParticipating) && (
            <button
              onClick={toggleComplete}
              disabled={complete.isPending || uncomplete.isPending}
              className={`flex-1 h-9 rounded-xl text-xs font-bold border transition ${exam.isCompleted ? 'bg-status-submitted/15 text-[#1F7D52] border-transparent' : 'bg-bg text-muted border-line hover:border-accent hover:text-accent'}`}
            >
              {exam.isCompleted ? 'สอบเสร็จแล้ว ✓' : 'กดเมื่อสอบเสร็จ'}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Calendar View ──
function CalendarView({ exams }: { exams: ExamEvent[] }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const examsByDay = useMemo(() => {
    const map = new Map<string, ExamEvent[]>();
    exams.forEach((e) => {
      const d = new Date(e.examDate + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = String(d.getDate());
        map.set(key, [...(map.get(key) ?? []), e]);
      }
    });
    return map;
  }, [exams, year, month]);

  const [selected, setSelected] = useState<number | null>(null);
  const selectedExams = selected ? (examsByDay.get(String(selected)) ?? []) : [];

  const monthName = new Date(year, month, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg text-muted">‹</button>
        <span className="text-sm font-bold text-ink">{monthName}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg text-muted">›</button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-line rounded-xl overflow-hidden">
        {['อา','จ','อ','พ','พฤ','ศ','ส'].map((d) => (
          <div key={d} className="bg-white text-center text-[10px] font-bold text-faint py-1.5">{d}</div>
        ))}
        {cells.map((day, i) => {
          const isToday2 = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasExams = day ? examsByDay.has(String(day)) : false;
          const dots = day ? (examsByDay.get(String(day)) ?? []) : [];
          return (
            <button
              key={i}
              onClick={() => day && setSelected(selected === day ? null : day)}
              className={`bg-white py-1.5 flex flex-col items-center gap-0.5 min-h-[44px] transition ${day && hasExams ? 'hover:bg-bg cursor-pointer' : 'cursor-default'} ${selected === day ? 'bg-accent/5' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday2 ? 'bg-accent text-white font-bold' : 'text-ink'}`}>{day}</span>
                  <div className="flex gap-0.5">
                    {dots.slice(0, 3).map((e, j) => (
                      <span key={j} className={`w-1.5 h-1.5 rounded-full ${EXAM_TYPE_COLOR[e.examType]?.split(' ')[0] ?? 'bg-faint'}`} />
                    ))}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {selectedExams.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {selectedExams.map((e) => (
            <div key={e.id} className="bg-white border border-line rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EXAM_TYPE_COLOR[e.examType] ?? ''}`}>{EXAM_TYPE_LABEL[e.examType]}</span>
                <span className="text-sm font-bold text-ink">{e.subject}</span>
              </div>
              {e.examTime && <div className="text-xs text-faint mt-0.5">{e.examTime}{e.endTime ? `–${e.endTime}` : ''}{e.location ? ` · ${e.location}` : ''}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Timeline View ──
function TimelineView({ exams, childId, isAdmin }: { exams: ExamEvent[]; childId?: string; isAdmin: boolean }) {
  const today = new Date().setHours(0, 0, 0, 0);

  const grouped = useMemo(() => {
    const past: ExamEvent[]    = [];
    const todayArr: ExamEvent[] = [];
    const week: ExamEvent[]    = [];
    const later: ExamEvent[]   = [];
    exams.forEach((e) => {
      const d = new Date(e.examDate + 'T00:00:00').getTime();
      const diff = Math.ceil((d - today) / 86400000);
      if (diff < 0)      past.push(e);
      else if (diff === 0) todayArr.push(e);
      else if (diff <= 7)  week.push(e);
      else                 later.push(e);
    });
    return { past, today: todayArr, week, later };
  }, [exams]);

  function Section({ title, items }: { title: string; items: ExamEvent[] }) {
    if (!items.length) return null;
    return (
      <div>
        <div className="text-xs font-extrabold text-faint uppercase tracking-wider mb-2">{title}</div>
        <div className="flex flex-col gap-2 mb-4">
          {items.map((e) => <ExamCard key={e.id} exam={e} childId={childId} isAdmin={isAdmin} />)}
        </div>
      </div>
    );
  }

  if (!exams.length) return <EmptyState title="ยังไม่มีตารางสอบ" />;
  return (
    <div>
      <Section title="วันนี้" items={grouped.today} />
      <Section title="สัปดาห์นี้" items={grouped.week} />
      <Section title="ถัดไป" items={grouped.later} />
      <Section title="ผ่านมาแล้ว" items={grouped.past} />
    </div>
  );
}

// ── Subject View ──
function SubjectView({ exams, childId, isAdmin }: { exams: ExamEvent[]; childId?: string; isAdmin: boolean }) {
  const grouped = useMemo(() => {
    const map = new Map<string, ExamEvent[]>();
    exams.forEach((e) => {
      map.set(e.subject, [...(map.get(e.subject) ?? []), e]);
    });
    return map;
  }, [exams]);

  if (!exams.length) return <EmptyState title="ยังไม่มีตารางสอบ" />;
  return (
    <div className="flex flex-col gap-4">
      {[...grouped.entries()].map(([subject, items]) => (
        <div key={subject}>
          <div className="text-xs font-extrabold text-faint uppercase tracking-wider mb-2">{subject}</div>
          <div className="flex flex-col gap-2">
            {items.map((e) => <ExamCard key={e.id} exam={e} childId={childId} isAdmin={isAdmin} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Banner: exams within 7 days ──
function UpcomingBanner({ exams }: { exams: ExamEvent[] }) {
  const soon = exams.filter((e) => { const d = daysUntil(e.examDate); return d >= 0 && d <= 7; });
  if (!soon.length) return null;
  return (
    <div className="bg-[#EBA53A]/10 border border-[#EBA53A]/30 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
      <span className="text-[#EBA53A]">📅</span>
      <div className="flex-1 min-w-0">
        {soon.length === 1 ? (
          <span className="text-xs font-semibold text-ink">สอบ{soon[0].subject} · {daysUntil(soon[0].examDate) === 0 ? 'วันนี้' : `อีก ${daysUntil(soon[0].examDate)} วัน`}</span>
        ) : (
          <span className="text-xs font-semibold text-ink">มีสอบ {soon.length} รายการใน 7 วันนี้</span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
export function ExamSchedulePage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('timeline');

  // /exam is always user-facing — admin managing exams goes to /admin/exam
  const childId = user?.roles.includes('child') ? user.userId : undefined;

  const { data: exams = [], isLoading } = useExams(childId);

  const visibleExams = useMemo(() => {
    return exams.filter((e) => e.examType !== 'competition' || e.isParticipating);
  }, [exams]);

  const views: { key: View; label: string }[] = [
    { key: 'timeline', label: 'ไทม์ไลน์' },
    { key: 'calendar', label: 'ปฏิทิน' },
    { key: 'subject',  label: 'วิชา' },
  ];

  return (
    <div>
      <PageHeader title="ตารางสอบ" />

      <UpcomingBanner exams={visibleExams} />

      {/* View switcher */}
      <div className="flex bg-bg rounded-xl p-1 mb-4 gap-1">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex-1 h-8 rounded-lg text-xs font-bold transition ${view === v.key ? 'bg-white shadow-sm text-ink' : 'text-faint hover:text-muted'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <>
          {view === 'calendar'  && <CalendarView exams={exams} />}
          {view === 'timeline'  && <TimelineView exams={visibleExams} childId={childId} isAdmin={false} />}
          {view === 'subject'   && <SubjectView  exams={visibleExams} childId={childId} isAdmin={false} />}
        </>
      )}
    </div>
  );
}
