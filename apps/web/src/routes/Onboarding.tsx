import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFamily } from '../hooks/useFamily';
import { Card, Button, PageHeader } from '../components/ui';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'choose' | 'create'>('choose');
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

  if (step === 'create') {
    return (
      <div className="min-h-screen bg-bg px-5 pt-8 pb-12">
        <div className="max-w-sm mx-auto">
          <button onClick={() => setStep('choose')} className="text-muted text-sm mb-3">← Back</button>
          <PageHeader title="Create family" />
          <Card>
            <label className="text-sm font-semibold text-ink">Family name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErr(''); }}
              placeholder="e.g. The Smiths"
              className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
            />
            {err && <div className="text-status-overdue text-xs mt-1">{err}</div>}
            <Button className="w-full mt-3" onClick={handleCreate} type="button">
              {createFamily.isPending ? 'Creating…' : 'Create and continue'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-5 pt-8 pb-12">
      <div className="max-w-sm mx-auto">
        <PageHeader title="Get started" sub="Create a family or join with an invite link" />
        <div className="flex flex-col gap-3">
          <Card>
            <div className="font-bold text-ink">Create a new family</div>
            <div className="text-sm text-muted mt-1 mb-3">Start now and invite members later</div>
            <Button className="w-full" onClick={() => setStep('create')}>Create family</Button>
          </Card>
          <Card>
            <div className="font-bold text-ink">Join with an invite link</div>
            <div className="text-sm text-muted mt-1 mb-3">Open the link from your email and sign in with the same Gmail</div>
            <Button variant="ghost" className="w-full" onClick={() => {}}>I have an invite link</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
