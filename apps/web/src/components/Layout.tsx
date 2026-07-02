import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '@homework-tracker/shared-types';

type AppRole = Role;

const NAV: Record<AppRole, { to: string; label: string; icon: string }[]> = {
  parent: [
    { to: '/dashboard', label: 'Homework',    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/family',    label: 'Family',      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 10v-2a4 4 0 0 0-3-3.87' },
    { to: '/requests',  label: 'Requests',    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   label: 'Profile',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  child: [
    { to: '/dashboard', label: 'Homework',    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/requests',  label: 'Requests',    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   label: 'Profile',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  teacher: [
    { to: '/teacher',   label: 'Class',       icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { to: '/requests',  label: 'Requests',    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/profile',   label: 'Profile',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  admin: [
    { to: '/admin',             label: 'Overview',    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { to: '/admin/assignments', label: 'Assignments', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
    { to: '/admin/progress',    label: 'Progress',    icon: 'M18 20V10M12 20V4M6 20v-6' },
    { to: '/admin/requests',    label: 'Requests',    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { to: '/admin/audit',       label: 'Audit',       icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
    { to: '/admin/teachers',    label: 'Teachers',    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 10v-2a4 4 0 0 0-3-3.87' },
    { to: '/admin/families',    label: 'Families',    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { to: '/admin/settings',    label: 'Settings',    icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.6-1.7a6 6 0 0 0 .1-1.3 6 6 0 0 0-.1-1.3l2.8-2.2a.7.7 0 0 0 .2-.8l-2.7-4.6a.7.7 0 0 0-.8-.3l-3.3 1.3a7 7 0 0 0-2.2-1.3l-.5-3.5A.7.7 0 0 0 12 2h-5.3a.7.7 0 0 0-.7.6l-.5 3.5A7 7 0 0 0 3.3 7.4L0 6.1a.7.7 0 0 0-.8.3L-3.5 11a.7.7 0 0 0 .2.8l2.8 2.2a6 6 0 0 0-.1 1.3 6 6 0 0 0 .1 1.3l-2.8 2.2a.7.7 0 0 0-.2.8l2.7 4.6a.7.7 0 0 0 .8.3l3.3-1.3a7 7 0 0 0 2.2 1.3l.5 3.5a.7.7 0 0 0 .7.6H12a.7.7 0 0 0 .7-.6l.5-3.5a7 7 0 0 0 2.2-1.3l3.3 1.3a.7.7 0 0 0 .8-.3l2.7-4.6a.7.7 0 0 0-.2-.8z' },
  ],
};

const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Admin', parent: 'Parent', child: 'Child', teacher: 'Teacher',
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

  const primaryRole: AppRole =
    user?.roles.includes('admin')   ? 'admin'   :
    user?.roles.includes('teacher') ? 'teacher' :
    user?.roles.includes('child')   ? 'child'   : 'parent';

  const navItems = NAV[primaryRole] ?? NAV.parent;
  // Bottom nav: max 5 items on mobile
  const bottomNav = navItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar (md+) ── */}
      <aside className="hidden md:flex w-60 flex-none flex-col border-r border-line bg-white sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shadow shadow-accent/30 flex-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-display font-bold text-[17px] text-ink">Homeroom</span>
        </div>

        {/* User card */}
        {user && (
          <div className="mx-3 mb-4 bg-bg rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            {user.pictureUrl ? (
              <img src={user.pictureUrl} className="w-8 h-8 rounded-full flex-none object-cover" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-accent-ink flex-none">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-ink truncate">{user.name}</div>
              <div className="text-[11px] text-faint">{ROLE_LABEL[primaryRole]}</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="text-[10px] font-extrabold tracking-widest text-faint uppercase mb-2 px-2">Menu</div>
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
                    {n.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-2.5 px-4 h-14 border-b border-line bg-white sticky top-0 z-30">
          <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center shadow shadow-accent/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-display font-bold text-[16px] text-ink">Homeroom</span>
          {user && (
            <div className="ml-auto">
              {user.pictureUrl ? (
                <img src={user.pictureUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-accent-ink">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}
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
                  <span>{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
