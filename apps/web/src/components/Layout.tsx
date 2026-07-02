import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '@homework-tracker/shared-types';

type AppRole = Role;

const NAV: Record<AppRole, { to: string; label: string }[]> = {
  parent: [
    { to: '/dashboard',  label: 'Homework' },
    { to: '/family',     label: 'Family' },
    { to: '/requests',   label: 'My requests' },
    { to: '/profile',    label: 'Profile' },
  ],
  child: [
    { to: '/dashboard',  label: 'My homework' },
    { to: '/requests',   label: 'My requests' },
    { to: '/profile',    label: 'Profile' },
  ],
  teacher: [
    { to: '/teacher',    label: 'Class overview' },
    { to: '/requests',   label: 'My requests' },
    { to: '/profile',    label: 'Profile' },
  ],
  admin: [
    { to: '/admin',             label: 'Overview' },
    { to: '/admin/assignments', label: 'Assignments' },
    { to: '/admin/progress',    label: 'Progress' },
    { to: '/admin/requests',    label: 'Requests' },
    { to: '/admin/audit',       label: 'Audit log' },
    { to: '/admin/teachers',    label: 'Teachers' },
    { to: '/admin/families',    label: 'Families' },
    { to: '/admin/settings',    label: 'Settings' },
  ],
};

const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Admin', parent: 'Parent', child: 'Child', teacher: 'Teacher',
};

function PhoneFrame() {
  return (
    <div
      className="w-[390px] h-[820px] flex-none rounded-[52px] p-2.5 sticky top-10"
      style={{ background: '#141320', boxShadow: '0 50px 90px -30px rgba(40,37,70,.65), 0 0 0 2px rgba(255,255,255,.05) inset' }}
    >
      <div className="relative w-full h-full bg-bg rounded-[42px] overflow-hidden flex flex-col">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-2xl z-40" style={{ background: '#0d0c16' }} />
        <div className="h-[46px] flex-none flex items-end justify-between px-7 pb-2 z-20">
          <span className="font-bold text-sm text-ink">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="17" height="11" viewBox="0 0 18 12" fill="#1B1A2A"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <svg width="24" height="12" viewBox="0 0 26 13"><rect x="0.5" y="0.5" width="21" height="12" rx="3.4" fill="none" stroke="#1B1A2A" strokeOpacity="0.35" /><rect x="2" y="2" width="15.5" height="9" rx="1.8" fill="#1B1A2A" /><rect x="23" y="4.2" width="2.2" height="4.6" rx="1" fill="#1B1A2A" fillOpacity="0.4" /></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-8 pt-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const { user } = useAuth();

  const primaryRole: AppRole =
    user?.roles.includes('admin')   ? 'admin'   :
    user?.roles.includes('teacher') ? 'teacher' :
    user?.roles.includes('child')   ? 'child'   : 'parent';

  const navItems = NAV[primaryRole] ?? NAV.parent;

  return (
    <div
      className="min-h-screen w-full overflow-x-auto"
      style={{ background: 'radial-gradient(120% 90% at 80% -10%, #E9E7F6 0%, #DFDEEC 45%, #D6D5E4 100%)' }}
    >
      <div className="flex justify-center items-start gap-8 w-max min-w-full mx-auto px-6 py-10">
        {/* Navigator */}
        <aside className="hidden md:flex w-56 flex-none flex-col gap-5 sticky top-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <span className="font-display font-bold text-lg text-[#26243a]">Homeroom</span>
            </div>
          </div>

          {user && (
            <div className="bg-white/70 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
              {user.pictureUrl ? (
                <img src={user.pictureUrl} className="w-8 h-8 rounded-full flex-none object-cover" />
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

          <div>
            <div className="text-[10.5px] font-extrabold tracking-widest text-[#8a89a0] uppercase mb-2">Screens</div>
            <div className="flex flex-col gap-0.5">
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/admin'}
                  className={({ isActive }) =>
                    `px-3 h-9 flex items-center rounded-lg text-[13px] font-semibold transition ${isActive ? 'bg-white text-accent-ink shadow-sm' : 'text-[#5a5970] hover:text-ink'}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </aside>

        {/* Phone */}
        <PhoneFrame />
      </div>
    </div>
  );
}
