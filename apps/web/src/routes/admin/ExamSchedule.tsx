import { useState } from 'react';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam, type ExamEvent } from '../../hooks/useExam';
import { Card, PageHeader, EmptyState, SkeletonCard, Button } from '../../components/ui';

const EXAM_TYPES = [
  { value: 'midterm',         label: 'กลางภาค' },
  { value: 'final',           label: 'ปลายภาค' },
  { value: 'out_of_schedule', label: 'นอกเวลา' },
  { value: 'competition',     label: 'แข่งขัน' },
];

const TYPE_COLOR: Record<string, string> = {
  midterm:         'bg-blue-100 text-blue-700',
  final:           'bg-purple-100 text-purple-700',
  out_of_schedule: 'bg-orange-100 text-orange-700',
  competition:     'bg-rose-100 text-rose-700',
};

const EMPTY: Partial<ExamEvent> = { examType: 'midterm', subject: '', examDate: '', examTime: '', endTime: '', location: '', isOpenWindow: false, registrationDeadline: '', announcementDate: '', admitCardDate: '' };

function ExamForm({ initial, onSave, onCancel, saving }: { initial: Partial<ExamEvent>; onSave: (v: Partial<ExamEvent>) => void; onCancel: () => void; saving: boolean }) {
  const [v, setV] = useState<Partial<ExamEvent>>(initial);
  const set = (k: keyof ExamEvent, val: unknown) => setV((p) => ({ ...p, [k]: val }));
  const isCompetition = v.examType === 'competition';

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-semibold text-faint uppercase">ประเภทการสอบ</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {EXAM_TYPES.map((t) => (
            <button key={t.value} onClick={() => set('examType', t.value)}
              className={`h-9 rounded-xl text-xs font-bold border transition ${v.examType === t.value ? 'bg-accent text-white border-accent' : 'bg-bg text-muted border-line hover:border-accent'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-faint uppercase">วิชา</label>
        <input value={v.subject ?? ''} onChange={(e) => set('subject', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" placeholder="เช่น คณิตศาสตร์" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-faint uppercase">วันสอบ</label>
          <input type="date" value={v.examDate ?? ''} onChange={(e) => set('examDate', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs font-semibold text-faint uppercase">เวลาเริ่ม</label>
          <input type="time" value={v.examTime ?? ''} onChange={(e) => set('examTime', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-faint uppercase">เวลาสิ้นสุด</label>
          <input type="time" value={v.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs font-semibold text-faint uppercase">สถานที่</label>
          <input value={v.location ?? ''} onChange={(e) => set('location', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" placeholder="ห้องสอบ..." />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={v.isOpenWindow ?? false} onChange={(e) => set('isOpenWindow', e.target.checked)} className="accent-accent w-4 h-4" />
        <span className="text-sm text-ink">เป็นช่วงเวลา (ต้องกดแจ้งสอบเสร็จ)</span>
      </label>

      {isCompetition && (
        <div className="border-t border-line pt-3 flex flex-col gap-3">
          <div className="text-xs font-extrabold text-faint uppercase tracking-wider">สนามแข่งขัน</div>
          <div>
            <label className="text-xs font-semibold text-faint uppercase">วันสมัคร (ก่อน)</label>
            <input type="date" value={v.registrationDeadline ?? ''} onChange={(e) => set('registrationDeadline', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-faint uppercase">ประกาศรายชื่อ</label>
              <input type="date" value={v.announcementDate ?? ''} onChange={(e) => set('announcementDate', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-faint uppercase">พิมพ์บัตรสอบ</label>
              <input type="date" value={v.admitCardDate ?? ''} onChange={(e) => set('admitCardDate', e.target.value)} className="w-full h-10 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>ยกเลิก</Button>
        <Button className="flex-1" onClick={() => onSave(v)} disabled={saving || !v.subject?.trim() || !v.examDate}>
          {saving ? 'กำลังบันทึก…' : 'บันทึก'}
        </Button>
      </div>
    </div>
  );
}

export function AdminExamSchedulePage() {
  const { data: exams = [], isLoading } = useExams();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      <PageHeader kicker="Admin" title="ตารางสอบ" sub="จัดการกำหนดการสอบทั้งหมด" />

      {!showCreate && (
        <Button variant="ghost" className="w-full mb-4 border-dashed" onClick={() => setShowCreate(true)}>
          + เพิ่มตารางสอบ
        </Button>
      )}

      {showCreate && (
        <Card className="mb-4">
          <div className="text-sm font-bold text-ink mb-3">เพิ่มตารางสอบใหม่</div>
          <ExamForm initial={EMPTY} onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={createExam.isPending} />
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : exams.length === 0 ? (
        <EmptyState title="ยังไม่มีตารางสอบ" />
      ) : (
        <div className="flex flex-col gap-2">
          {exams.map((e) => {
            if (editId === e.id) {
              return (
                <Card key={e.id}>
                  <div className="text-sm font-bold text-ink mb-3">แก้ไขตารางสอบ</div>
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
                        {EXAM_TYPES.find((t) => t.value === e.examType)?.label ?? e.examType}
                      </span>
                      {e.isOpenWindow && <span className="text-[11px] text-faint">· ช่วงเวลา</span>}
                    </div>
                    <div className="font-bold text-[15px] text-ink">{e.subject}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {new Date(e.examDate + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {e.examTime && <span> · {e.examTime}{e.endTime ? `–${e.endTime}` : ''}</span>}
                      {e.location && <span> · {e.location}</span>}
                    </div>
                    {e.examType === 'competition' && (
                      <div className="mt-1 text-xs text-faint flex flex-wrap gap-x-3">
                        {e.registrationDeadline && <span>สมัคร: {new Date(e.registrationDeadline + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>}
                        {e.announcementDate     && <span>ประกาศ: {new Date(e.announcementDate + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>}
                        {e.admitCardDate        && <span>พิมพ์บัตร: {new Date(e.admitCardDate + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-none">
                    <button onClick={() => setEditId(e.id)} className="text-xs text-accent font-semibold px-2 py-1 rounded-lg hover:bg-accent/10 transition">แก้ไข</button>
                    <button onClick={() => setDeleteId(e.id)} className="text-xs text-status-overdue font-semibold px-2 py-1 rounded-lg hover:bg-status-overdue/10 transition">ลบ</button>
                  </div>
                </div>

                {deleteId === e.id && (
                  <div className="mt-3 pt-3 border-t border-line">
                    <div className="text-sm text-ink mb-2">ยืนยันลบ "{e.subject}"?</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>ยกเลิก</Button>
                      <Button variant="danger" className="flex-1" onClick={() => handleDelete(e.id)} disabled={deleteExam.isPending}>
                        {deleteExam.isPending ? 'กำลังลบ…' : 'ลบ'}
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
