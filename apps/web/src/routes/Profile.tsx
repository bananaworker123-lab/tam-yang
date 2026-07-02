import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Avatar, Button, PageHeader } from '../components/ui';
import type { Locale } from '../i18n';
import { useT } from '../i18n';

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', parent: 'Parent', child: 'Student', teacher: 'Teacher' };

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t, locale, setLocale } = useT();

  const initials = user ? (user.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??') : '??';

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    qc.setQueryData(['me'], null);  // clear user immediately, no refetch
    navigate('/', { replace: true });
  }

  return (
    <div>
      <PageHeader title="Profile" />

      <Card>
        <div className="flex items-center gap-3">
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <Avatar initials={initials} className="w-12 h-12 text-sm" />
          )}
          <div>
            <div className="font-bold text-ink">{user?.name ?? 'User'}</div>
            <div className="text-sm text-muted">{user?.email ?? ''}</div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-y-3 text-sm mt-4">
          <dt className="text-muted">Role</dt>
          <dd className="text-ink font-semibold text-right">{user?.roles.map((r) => ROLE_LABEL[r] ?? r).join(', ') ?? '—'}</dd>
          <dt className="text-muted">Family</dt>
          <dd className="text-ink font-semibold text-right">{user?.familyId ? 'Joined' : user?.roles.includes('admin') ? 'Admin' : 'Not joined'}</dd>
        </dl>
      </Card>

      <div className="text-[11px] font-extrabold tracking-widest text-faint uppercase mt-6 mb-2">Settings</div>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-ink text-sm">Language</div>
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

      <Button variant="ghost" className="w-full mt-6" onClick={logout}>Sign out</Button>
    </div>
  );
}
