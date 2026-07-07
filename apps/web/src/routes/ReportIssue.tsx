import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllAssignments } from '../hooks/useAssignments';
import { useCreateRequest } from '../hooks/useRequests';
import { Card, Button, PageHeader } from '../components/ui';

type RequestType = 'homework' | 'exam';

const EXAM_TYPES = [
  { value: 'midterm',         label: 'กลางภาค' },
  { value: 'final',           label: 'ปลายภาค' },
  { value: 'out_of_schedule', label: 'นอกเวลา' },
  { value: 'competition',     label: 'แข่งขัน' },
];

export function ReportIssuePage() {
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
        if (!detail.trim()) { setErr('กรุณากรอกรายละเอียด'); return; }
        await createRequest.mutateAsync({ detail: detail.trim(), assignmentId: assignmentId || undefined, requestType: 'homework' });
      } else {
        if (!subject.trim() || !examDate) { setErr('กรุณากรอกวิชาและวันสอบ'); return; }
        const examData = JSON.stringify({ examType, subject, examDate, examTime, endTime, location, isOpenWindow, registrationDeadline: regDeadline, announcementDate: announceDate, admitCardDate: admitDate, note: examNote });
        await createRequest.mutateAsync({ detail: `ขอเพิ่มตารางสอบ: ${subject} (${EXAM_TYPES.find(t => t.value === examType)?.label})`, requestType: 'exam', examData });
      }
      navigate('/requests');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  }

  // Step 1: choose type
  if (!type) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="text-muted text-sm mb-3">← กลับ</button>
        <PageHeader title="ขอเพิ่มข้อมูล" />
        <div className="flex flex-col gap-3 mt-2">
          <button onClick={() => setType('homework')}
            className="bg-white border border-line rounded-2xl px-5 py-4 text-left hover:border-accent transition flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">📚</div>
            <div>
              <div className="font-bold text-ink">การบ้าน</div>
              <div className="text-xs text-faint mt-0.5">แจ้งแก้ไขหรือเพิ่มเติมข้อมูลการบ้าน</div>
            </div>
          </button>
          <button onClick={() => setType('exam')}
            className="bg-white border border-line rounded-2xl px-5 py-4 text-left hover:border-accent transition flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">📝</div>
            <div>
              <div className="font-bold text-ink">ตารางสอบ</div>
              <div className="text-xs text-faint mt-0.5">ขอเพิ่มกำหนดการสอบใหม่</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setType(null)} className="text-muted text-sm mb-3">← กลับ</button>
      <PageHeader title={type === 'homework' ? 'แจ้งเรื่องการบ้าน' : 'ขอเพิ่มตารางสอบ'} />

      <Card className="mt-2">
        {type === 'homework' ? (
          <>
            <label className="text-sm font-semibold text-ink">การบ้านที่เกี่ยวข้อง</label>
            <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 mb-3 outline-none focus:border-accent">
              <option value="">— ไม่ระบุ —</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.subject} · {a.topic} ({a.dueDate})</option>
              ))}
            </select>
            <label className="text-sm font-semibold text-ink">รายละเอียด</label>
            <textarea value={detail} onChange={(e) => { setDetail(e.target.value); setErr(''); }} rows={4}
              className="w-full rounded-xl border border-line px-3 py-2 text-sm mt-1 outline-none focus:border-accent resize-none"
              placeholder="อธิบายสิ่งที่ต้องการแก้ไข..." />
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-faint uppercase">ประเภทการสอบ</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {EXAM_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setExamType(t.value)}
                    className={`h-9 rounded-xl text-xs font-bold border transition ${examType === t.value ? 'bg-accent text-white border-accent' : 'bg-bg text-muted border-line'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-faint uppercase">วิชา</label>
              <input value={subject} onChange={(e) => { setSubject(e.target.value); setErr(''); }}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" placeholder="เช่น คณิตศาสตร์" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-faint uppercase">วันสอบ</label>
                <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); setErr(''); }}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-faint uppercase">เวลาเริ่ม</label>
                <input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-faint uppercase">เวลาสิ้นสุด</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-faint uppercase">สถานที่</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" placeholder="ห้องสอบ..." />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOpenWindow} onChange={(e) => setIsOpenWindow(e.target.checked)} className="accent-accent w-4 h-4" />
              <span className="text-sm text-ink">เป็นช่วงเวลา (ต้องกดแจ้งสอบเสร็จ)</span>
            </label>
            {examType === 'competition' && (
              <div className="border-t border-line pt-3 flex flex-col gap-3">
                <div className="text-xs font-extrabold text-faint uppercase tracking-wider">ข้อมูลสนามแข่งขัน</div>
                <div>
                  <label className="text-xs font-semibold text-faint uppercase">วันสุดท้ายของการสมัคร</label>
                  <input type="date" value={regDeadline} onChange={(e) => setRegDeadline(e.target.value)}
                    className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-faint uppercase">วันประกาศรายชื่อ</label>
                    <input type="date" value={announceDate} onChange={(e) => setAnnounceDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-faint uppercase">วันพิมพ์บัตรสอบ</label>
                    <input type="date" value={admitDate} onChange={(e) => setAdmitDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-faint uppercase">หมายเหตุเพิ่มเติม</label>
              <textarea value={examNote} onChange={(e) => setExamNote(e.target.value)} rows={2}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm mt-1 outline-none focus:border-accent resize-none" placeholder="ข้อมูลเพิ่มเติม..." />
            </div>
          </div>
        )}

        {err && <div className="text-status-overdue text-xs mt-2">{err}</div>}
        <Button className="w-full mt-3" onClick={submit} disabled={createRequest.isPending}>
          {createRequest.isPending ? 'กำลังส่ง…' : 'ส่งคำขอ'}
        </Button>
      </Card>
    </div>
  );
}
