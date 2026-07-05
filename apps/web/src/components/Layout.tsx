import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n';
import { api } from '../lib/api';
import type { Role } from '@homework-tracker/shared-types';

type AppRole = Role;

const NAV: Record<AppRole, { to: string; labelKey: string; icon: string }[]> = {
  parent: [
    { to: '/dashboard', labelKey: 'nav.homework',   icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/requests',  labelKey: 'nav.myRequests', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   labelKey: 'nav.profile',   icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  child: [
    { to: '/dashboard', labelKey: 'nav.homework',   icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/requests',  labelKey: 'nav.myRequests', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   labelKey: 'nav.profile',   icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  teacher: [
    { to: '/teacher',   labelKey: 'nav.class',      icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { to: '/requests',  labelKey: 'nav.myRequests', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   labelKey: 'nav.profile',   icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  admin: [
    { to: '/admin',             labelKey: 'nav.overview',     icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { to: '/admin/assignments', labelKey: 'nav.assignments',  icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/admin/progress',    labelKey: 'nav.progress',     icon: 'M18 20V10M12 20V4M6 20v-6' },
    { to: '/admin/requests',    labelKey: 'nav.requests',     icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/admin/audit',       labelKey: 'nav.audit',        icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  ],
};

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.userId) return;

    if (!user.roles.includes('admin')) {
      // Prefetch progress immediately — backend resolves active class/term from DB (no waterfall)
      const childId = user.roles.includes('child') ? user.userId : undefined;
      const params  = new URLSearchParams();
      if (childId) params.set('childId', childId);
      qc.prefetchQuery({
        queryKey: ['progress', childId],
        queryFn:  () => api.get(`/progress?${params}`),
        staleTime: 1000 * 60 * 2,
      });
    }

    if (!user.roles.includes('admin')) return;
    qc.prefetchQuery({ queryKey: ['oversight', 'admin', 'overview'], queryFn: () => api.get('/oversight/admin/overview'), staleTime: 1000 * 60 * 2 });
    qc.prefetchQuery({ queryKey: ['oversight', 'admin', 'families'], queryFn: () => api.get('/oversight/admin/families'), staleTime: 1000 * 60 * 2 });
  }, [user?.userId]);

  // Determine non-admin base role
  const baseRole: AppRole =
    user?.roles.includes('teacher') ? 'teacher' :
    user?.roles.includes('child')   ? 'child'   : 'parent';

  const isAdmin = user?.roles.includes('admin') ?? false;

  // Default to non-admin view when user has both admin + other roles
  const hasOtherRole = user?.roles.some((r) => r !== 'admin') ?? false;
  const [viewingAdmin, setViewingAdmin] = useState<boolean>(
    isAdmin && !hasOtherRole  // only-admin user → start in admin view
  );

  const activeRole: AppRole = viewingAdmin ? 'admin' : baseRole;
  const navItems = (NAV[activeRole] ?? NAV.parent).filter(
    (n) => !(isAdmin && n.to === '/requests'),
  );
  const bottomNav = navItems.slice(0, 5);

  function switchToAdmin() {
    setViewingAdmin(true);
    navigate('/admin', { replace: true });
  }

  function switchToUser() {
    setViewingAdmin(false);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar (md+) ── */}
      <aside className="hidden md:flex w-60 flex-none flex-col border-r border-line bg-white sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shadow shadow-accent/30 flex-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-display font-bold text-[17px] text-ink">Tam-Yang</span>
        </div>

        {/* User card */}
        {user && (
          <div className="mx-3 mb-4 bg-bg rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            {user.pictureUrl ? (
              <img src={user.pictureUrl} className="w-8 h-8 rounded-full flex-none object-cover" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-accent-ink flex-none">
                {(user.shortName?.toUpperCase() || user.name.slice(0, 2).toUpperCase())}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-ink truncate">{user.name}</div>
              <div className="text-[11px] text-faint">{t(`role.${activeRole}`)}</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="text-[10px] font-extrabold tracking-widest text-faint uppercase mb-2 px-2">{t('nav.menu')}</div>
          <div className="flex flex-col gap-0.5">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-accent text-white' : 'text-muted hover:bg-bg hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'opacity-100' : 'opacity-60'}><Icon d={n.icon} /></span>
                    {t(n.labelKey)}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Role switcher */}
        {isAdmin && hasOtherRole && (
          <div className="px-3 pb-5">
            <button
              onClick={viewingAdmin ? switchToUser : switchToAdmin}
              className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg text-xs font-semibold text-muted hover:bg-bg hover:text-ink transition border border-line"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {viewingAdmin ? `${t('nav.switchTo')} ${t(`role.${baseRole}`)}` : t('nav.switchToAdmin')}
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-2.5 px-4 h-14 border-b border-line bg-white sticky top-0 z-30">
          <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center shadow shadow-accent/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-display font-bold text-[16px] text-ink">Tam-Yang</span>

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile role switcher */}
            {isAdmin && hasOtherRole && (
              <button
                onClick={viewingAdmin ? switchToUser : switchToAdmin}
                className="h-7 px-2.5 rounded-lg text-[10px] font-bold border border-line text-muted hover:bg-bg transition"
              >
                {viewingAdmin ? t(`role.${baseRole}`) : t('role.admin')}
              </button>
            )}
            {user && (
              user.pictureUrl ? (
                <img src={user.pictureUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-accent-ink">
                  {(user.shortName?.toUpperCase() || user.name.slice(0, 2).toUpperCase())}
                </div>
              )
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7 pb-24 md:pb-7 max-w-2xl w-full mx-auto md:max-w-3xl">
          <Outlet />
        </main>

        {/* ── Bottom nav (mobile) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line z-30 flex">
          {bottomNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/admin'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                  isActive ? 'text-accent' : 'text-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'opacity-100' : 'opacity-50'}><Icon d={n.icon} /></span>
                  <span>{t(n.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
