import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFamily } from '../hooks/useFamily';
import { Card, Button, PageHeader } from '../components/ui';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const createFamily = useCreateFamily();

  async function handleCreate() {
    if (!name.trim()) { setErr('Please enter a family name'); return; }
    try {
      await createFamily.mutateAsync(name.trim());
      navigate('/dashboard', { replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create family');
    }
  }

  return (
    <div className="min-h-screen bg-bg px-5 pt-8 pb-12">
      <div className="max-w-sm mx-auto">
        <PageHeader title="Welcome!" sub="Let's set up your family" />
        <Card className="mb-3">
          <div className="font-bold text-ink mb-1">Name your family</div>
          <div className="text-xs text-muted mb-3">ตั้งชื่อ family สำหรับแสดงในแอป</div>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setErr(''); }}
            placeholder="เช่น ครอบครัวสมิธ, The Tans…"
            className="w-full h-11 rounded-xl border border-line px-3 text-sm outline-none focus:border-accent"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          {err && <div className="text-status-overdue text-xs mt-1">{err}</div>}
          <Button className="w-full mt-3" onClick={handleCreate} disabled={createFamily.isPending}>
            {createFamily.isPending ? 'Creating…' : 'Create family & continue'}
          </Button>
        </Card>

        <div className="text-center text-xs text-faint">
          ถูก invite มาอยู่แล้ว? เปิด link จาก QR code ได้เลย ไม่ต้องสร้าง family ใหม่
        </div>
      </div>
    </div>
  );
}
