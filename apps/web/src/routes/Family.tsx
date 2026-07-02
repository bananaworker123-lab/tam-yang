import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFamily, useInviteMember } from '../hooks/useFamily';
import { Card, Avatar, Button, PageHeader, EmptyState, StatusBanner } from '../components/ui';

export function FamilyPage() {
  const { user } = useAuth();
  const { data, isLoading } = useFamily();
  const inviteMember = useInviteMember();
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'parent' | 'child'>('child');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  async function handleInvite() {
    if (!email.trim()) return;
    try {
      await inviteMember.mutateAsync({ email: email.trim(), role: inviteRole });
      setSuccess(`Invite sent to ${email.trim()}`);
      setEmail('');
      setErr('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to send invite');
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;

  const members = (data as any)?.members ?? [];
  const invites  = (data as any)?.invites  ?? [];

  return (
    <div>
      <PageHeader title="Family" sub="Members & invites" />

      <Card className="mb-4">
        <div className="font-bold text-ink mb-3">Members</div>
        {members.length === 0 ? <EmptyState title="No members yet" /> : (
          <div className="flex flex-col gap-3">
            {members.map((m: any) => (
              <div key={m.userId} className="flex items-center gap-3">
                <Avatar initials={(m.name?.slice(0, 2) ?? '??').toUpperCase()} />
                <div className="flex-1">
                  <div className="font-semibold text-ink text-sm">{m.name}</div>
                  <div className="text-xs text-faint">{m.role === 'parent' ? 'Parent' : 'Child'} · {m.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <div className="font-bold text-ink mb-3">Invite a member</div>
        {success && <div className="text-[#1F7D52] text-xs mb-2 font-semibold">{success}</div>}
        <input value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); setSuccess(''); }}
          placeholder="Gmail address to invite"
          className="w-full h-11 rounded-xl border border-line px-3 text-sm mb-2 outline-none focus:border-accent" />
        <div className="flex gap-2 mb-3">
          {(['parent', 'child'] as const).map((r) => (
            <button key={r} onClick={() => setInviteRole(r)}
              className={`h-9 px-3 rounded-lg text-xs font-bold ${inviteRole === r ? 'bg-accent text-white' : 'bg-bg text-muted'}`}>
              {r === 'parent' ? 'Parent' : 'Child'}
            </button>
          ))}
        </div>
        {err && <div className="text-status-overdue text-xs mb-2">{err}</div>}
        <Button className="w-full" onClick={handleInvite}>{inviteMember.isPending ? 'Sending…' : 'Send invite'}</Button>
      </Card>

      {invites.length > 0 && (
        <Card>
          <div className="font-bold text-ink mb-3">Pending invites</div>
          <div className="flex flex-col gap-2">
            {invites.map((i: any) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-ink">{i.email}</div>
                  <div className="text-xs text-faint">{i.role === 'parent' ? 'Parent' : 'Child'} · <span className="text-status-done font-semibold">Pending</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
