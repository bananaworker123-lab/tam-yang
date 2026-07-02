import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useFamily, useInviteMember } from '../hooks/useFamily';
import { Card, Avatar, Button, PageHeader, EmptyState } from '../components/ui';

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function QRModal({ token, role, onClose }: { token: string; role: string; onClose: () => void }) {
  const inviteUrl = `${window.location.origin}/join?token=${token}`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 pb-6 md:pb-0"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex items-center justify-between">
          <div>
            <div className="font-bold text-ink text-base">Scan to join</div>
            <div className="text-xs text-faint mt-0.5">Role: <span className="font-semibold capitalize">{role}</span></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:bg-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="bg-white p-3 rounded-xl border border-line shadow-sm">
          <QRCodeSVG value={inviteUrl} size={220} level="M" />
        </div>

        <p className="text-xs text-muted text-center">
          สแกน QR ด้วยกล้องโทรศัพท์<br />แล้ว Sign in with Google เพื่อเข้า family
        </p>

        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-line text-sm text-muted hover:bg-bg transition"
        >
          <CopyIcon />
          {copied ? 'Copied!' : 'Copy invite link'}
        </button>
      </div>
    </div>
  );
}

export function FamilyPage() {
  const { user } = useAuth();
  const { data, isLoading } = useFamily();
  const inviteMember = useInviteMember();
  const [inviteRole, setInviteRole] = useState<'parent' | 'child'>('child');
  const [err, setErr] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);

  async function handleGenerate() {
    try {
      const res = await inviteMember.mutateAsync(inviteRole);
      setQrToken(res.token);
      setErr('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create invite');
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );

  const members = (data as any)?.members ?? [];
  const invites = (data as any)?.invites ?? [];

  return (
    <div>
      {qrToken && (
        <QRModal token={qrToken} role={inviteRole} onClose={() => setQrToken(null)} />
      )}

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
                  <div className="text-xs text-faint capitalize">{m.role} · {m.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <div className="font-bold text-ink mb-1">Invite a member</div>
        <div className="text-xs text-muted mb-3">สร้าง QR code แล้วให้สมาชิกใหม่สแกน</div>
        <div className="flex gap-2 mb-3">
          {(['child', 'parent'] as const).map((r) => (
            <button key={r} onClick={() => setInviteRole(r)}
              className={`h-9 px-4 rounded-lg text-xs font-bold transition ${inviteRole === r ? 'bg-accent text-white' : 'bg-bg text-muted hover:bg-line'}`}>
              {r === 'parent' ? 'Parent' : 'Child'}
            </button>
          ))}
        </div>
        {err && <div className="text-status-overdue text-xs mb-2">{err}</div>}
        <Button className="w-full" onClick={handleGenerate} disabled={inviteMember.isPending}>
          {inviteMember.isPending ? 'Generating…' : 'Generate QR code'}
        </Button>
      </Card>

      {invites.filter((i: any) => i.status === 'pending').length > 0 && (
        <Card>
          <div className="font-bold text-ink mb-3">Pending invites</div>
          <div className="flex flex-col gap-2">
            {invites.filter((i: any) => i.status === 'pending').map((i: any) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-ink">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4l3 3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-ink capitalize">{i.role} invite</div>
                  <div className="text-xs text-faint">Waiting for someone to scan</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
