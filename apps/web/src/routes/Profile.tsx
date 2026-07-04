import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useFamily, useInviteMember, useRemoveMember, useUpdateMemberName, useUpdateMemberShort } from '../hooks/useFamily';
import { QRCodeSVG } from 'qrcode.react';
import { Card, Avatar, Button, PageHeader, SkeletonLine } from '../components/ui';
import type { Locale } from '../i18n';
import { useT } from '../i18n';

function ShareCard() {
  const { t } = useT();
  const appUrl = window.location.origin;
  const [copied, setCopied] = useState(false);

  function shareViaLine() {
    const text = encodeURIComponent(`ลองใช้แอป Tam-Yang ติดตามการบ้านกัน! ${appUrl}`);
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
  }

  function copyUrl() {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="mb-4">
      <div className="font-semibold text-ink text-sm mb-3">{t('profile.shareDesc')}</div>
      <div className="flex gap-2">
        <button onClick={shareViaLine}
          className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-white transition active:scale-95"
          style={{ background: '#06C755' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 3.16 1.73 5.95 4.35 7.65-.19.69-.7 2.52-.8 2.91-.13.48.18.47.37.35.15-.1 2.37-1.56 3.33-2.19.56.08 1.14.13 1.75.13 5.52 0 10-4.03 10-9S17.52 2 12 2zm-3.5 11.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5zm6 0h-3.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3h2a.5.5 0 0 1 0 1zm1-4.5v1.5h1v1h-1V13h-1V9h1zm-3.5 0h1v3.5h-1z"/>
          </svg>
          LINE
        </button>
        <button onClick={copyUrl}
          className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border border-line text-ink hover:bg-bg transition active:scale-95">
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              {t('profile.copied')}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {t('profile.copyUrl')}
            </>
          )}
        </button>
      </div>
    </Card>
  );
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function QRModal({ token, role, onClose }: { token: string; role: string; onClose: () => void }) {
  const { t } = useT();
  const inviteUrl = `${window.location.origin}/join?token=${token}`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const roleLabel = role === 'parent' ? t('family.roleParent') : t('family.roleChild');

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 pb-6 md:pb-0"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="font-bold text-ink text-base">{t('family.inviteAs')} {roleLabel}</div>
        <QRCodeSVG value={inviteUrl} size={200} />
        <button onClick={copyLink}
          className="w-full h-11 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-bg transition flex items-center justify-center gap-2">
          {copied ? '✓ Copied!' : t('family.copyLink')}
        </button>
        <button onClick={onClose} className="text-xs text-faint">{t('family.close')}</button>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t, locale, setLocale } = useT();
  const { data, isLoading: familyLoading } = useFamily();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateMemberName = useUpdateMemberName();
  const updateMemberShort = useUpdateMemberShort();

  const [inviteRole, setInviteRole] = useState<'parent' | 'child'>('child');
  const [inviteErr, setInviteErr] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; name: string } | null>(null);
  const [editingMember, setEditingMember] = useState<{ userId: string; name: string; shortName: string } | null>(null);

  const initials = user
    ? (user.shortName?.toUpperCase() || user.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '??')
    : '??';

  const isParent = user?.roles.includes('parent');
  const hasFamilyId = !!user?.familyId;
  const members = (data as any)?.members ?? [];
  const familyName = (data as any)?.familyName ?? '';

  async function handleLogout() {
    await api.post('/auth/logout').catch(() => {});
    qc.setQueryData(['me'], null);
    navigate('/', { replace: true });
  }

  async function handleGenerate() {
    try {
      const res = await inviteMember.mutateAsync(inviteRole);
      setQrToken(res.token);
      setInviteErr('');
    } catch (e: unknown) {
      setInviteErr(e instanceof Error ? e.message : 'Failed to create invite');
    }
  }

  async function handleRemove() {
    if (!confirmRemove) return;
    try { await removeMember.mutateAsync(confirmRemove.userId); } catch (_) {}
    setConfirmRemove(null);
  }

  return (
    <div>
      {qrToken && <QRModal token={qrToken} role={inviteRole} onClose={() => setQrToken(null)} />}

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
          onClick={() => setConfirmRemove(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-ink mb-1">{t('family.removeConfirm')}</div>
            <div className="text-sm text-muted mb-4">{confirmRemove.name}</div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmRemove(null)}
                className="flex-1 h-10 rounded-xl border border-line text-sm text-muted">
                {t('family.cancel')}
              </button>
              <button onClick={handleRemove} disabled={removeMember.isPending}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-60">
                {removeMember.isPending ? t('family.removing') : t('family.remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader title={t('profile.title')} />

      {/* User card */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-none" />
          ) : (
            <Avatar initials={initials} className="w-12 h-12 text-sm flex-none" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-ink truncate">{user?.name ?? 'User'}</div>
            <div className="text-sm text-muted truncate">{user?.email ?? ''}</div>
            <div className="text-xs text-faint mt-0.5 capitalize">{user?.roles.map((r) => t(`role.${r}`)).join(' · ') ?? '—'}</div>
          </div>
        </div>
      </Card>

      {/* Family members */}
      {hasFamilyId && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-ink">{familyName || t('family.title')}</div>
              <div className="text-xs text-muted">{t('family.sub')}</div>
            </div>
          </div>

          {familyLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-line flex-none" />
                  <SkeletonLine className="flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {members.map((m: any) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <Avatar initials={m.shortName?.toUpperCase() || (m.name?.slice(0, 2) ?? '??').toUpperCase()} />
                  {editingMember?.userId === m.userId ? (() => {
                    const em = editingMember!;
                    const isSaving = updateMemberName.isPending || updateMemberShort.isPending;
                    function saveAll() {
                      let done = 0;
                      const tryClose = () => { if (++done === 2) setEditingMember(null); };
                      updateMemberName.mutate({ userId: m.userId, name: em.name }, { onSuccess: tryClose, onError: tryClose });
                      updateMemberShort.mutate({ userId: m.userId, shortName: em.shortName }, { onSuccess: tryClose, onError: tryClose });
                    }
                    return (
                      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <input autoFocus value={em.name}
                            onChange={(e) => setEditingMember({ ...em, name: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveAll(); else if (e.key === 'Escape') setEditingMember(null); }}
                            placeholder="ชื่อ"
                            className="flex-1 min-w-0 h-8 px-2 text-sm rounded-lg border border-accent focus:outline-none" />
                          <input value={em.shortName} maxLength={4}
                            onChange={(e) => setEditingMember({ ...em, shortName: e.target.value.slice(0, 4) })}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveAll(); else if (e.key === 'Escape') setEditingMember(null); }}
                            placeholder="ย่อ"
                            className="w-16 h-8 px-2 text-sm rounded-lg border border-accent focus:outline-none text-center font-bold" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveAll} disabled={isSaving}
                            className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold disabled:opacity-60">
                            {isSaving ? 'Saving…' : t('family.save')}
                          </button>
                          <button onClick={() => setEditingMember(null)}
                            className="h-8 px-3 rounded-lg border border-line text-xs text-muted">
                            {t('family.cancel')}
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink text-sm truncate">{m.name}</div>
                        <div className="text-xs text-faint capitalize">{m.role} · {m.email}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-none">
                        <button onClick={() => setEditingMember({ userId: m.userId, name: m.name, shortName: m.shortName ?? '' })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:text-accent hover:bg-accent/10 transition">
                          <PencilIcon />
                        </button>
                        {isParent && m.userId !== user?.userId && (
                          <button onClick={() => setConfirmRemove({ userId: m.userId, name: m.name })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:text-red-500 hover:bg-red-50 transition">
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invite section (parent only) */}
          {isParent && (
            <div className="mt-4 pt-3 border-t border-line">
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{t('family.inviteTitle')}</div>
              <div className="flex gap-2 mb-3">
                {(['child', 'parent'] as const).map((r) => (
                  <button key={r} onClick={() => setInviteRole(r)}
                    className={`h-8 px-3 rounded-lg text-xs font-bold transition ${inviteRole === r ? 'bg-accent text-white' : 'bg-bg text-muted hover:bg-line'}`}>
                    {r === 'parent' ? t('family.roleParent') : t('family.roleChild')}
                  </button>
                ))}
              </div>
              {inviteErr && <div className="text-status-overdue text-xs mb-2">{inviteErr}</div>}
              <Button className="w-full" onClick={handleGenerate} disabled={inviteMember.isPending}>
                {inviteMember.isPending ? t('family.generating') : t('family.generateQr')}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Share App */}
      <div className="text-[11px] font-extrabold tracking-widest text-faint uppercase mb-2">{t('profile.share')}</div>
      <ShareCard />

      {/* Settings */}
      <div className="text-[11px] font-extrabold tracking-widest text-faint uppercase mb-2">{t('profile.settings')}</div>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-ink text-sm">{t('profile.language')}</div>
            <div className="text-xs text-faint mt-0.5">EN / TH</div>
          </div>
          <div className="flex gap-1 bg-bg rounded-xl p-1">
            {(['en', 'th'] as Locale[]).map((l) => (
              <button key={l} onClick={() => setLocale(l)}
                className={`h-9 px-4 rounded-lg text-sm font-bold transition ${locale === l ? 'bg-accent text-white' : 'text-muted'}`}>
                {l === 'en' ? 'English' : 'ไทย'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Button variant="ghost" className="w-full" onClick={handleLogout}>{t('profile.signOut')}</Button>
    </div>
  );
}
