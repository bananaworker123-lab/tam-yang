import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const apiBase = import.meta.env.VITE_API_BASE ?? '/api/v1';
  const navigate = useNavigate();

  // If already logged in (session exists), redirect straight to app
  useEffect(() => {
    fetch(`${apiBase}/me`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((user) => { if (user?.userId) navigate('/home', { replace: true }); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-bg to-accent-soft">
      <div className="w-full max-w-sm flex flex-col items-center gap-7 text-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <span className="font-display font-bold text-3xl text-ink">Homeroom</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Track homework, all in one place</h1>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            One shared master list for the whole class. Each family tracks their own children.
          </p>
        </div>
        <a
          href={`${apiBase}/auth/google`}
          className="w-full h-12 rounded-2xl bg-white border border-line flex items-center justify-center gap-3 font-semibold text-ink shadow-sm hover:shadow transition"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.5 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
          </svg>
          Sign in with Google
        </a>
        <p className="text-faint text-xs">Sign in with a Google account only</p>
      </div>
    </div>
  );
}
