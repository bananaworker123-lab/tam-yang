import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, PageHeader } from '../components/ui';

export function CreateFamilyPage() {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg px-5 pt-8 pb-12">
    <div className="max-w-sm mx-auto">
      <button onClick={() => navigate('/onboarding')} className="text-muted text-sm mb-3">← Back</button>
      <PageHeader title="Create family" />
      <Card>
        <label className="text-sm font-semibold text-ink">Family name</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(''); }}
          placeholder="e.g. The Carters"
          className="w-full h-11 rounded-xl border border-line px-3 text-sm mt-1 outline-none focus:border-accent"
        />
        {err ? <div className="text-status-overdue text-xs mt-1">{err}</div> : null}
        <Button
          className="w-full mt-3"
          onClick={() => {
            if (!name.trim()) { setErr('Please enter a family name'); return; }
            navigate('/dashboard');
          }}
        >
          Create and continue
        </Button>
      </Card>
    </div>
    </div>
  );
}
