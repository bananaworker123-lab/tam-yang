import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function JoinFamilyPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user, refetch } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link — no token found.');
      return;
    }

    // Not logged in yet → redirect to Google sign-in, come back after
    if (!user) {
      const returnTo = encodeURIComponent(`/join?token=${token}`);
      window.location.href = `/api/v1/auth/google?returnTo=${returnTo}`;
      return;
    }

    // Already logged in → accept right away
    if (status === 'idle') {
      setStatus('loading');
      api
        .post<{ familyId: string; role: string }>(`/families/invites/${token}/accept`)
        .then(() => {
          setStatus('success');
          return refetch();
        })
        .then(() => {
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        })
        .catch((e: unknown) => {
          setStatus('error');
          setMessage(e instanceof Error ? e.message : 'Failed to accept invite.');
        });
    }
  }, [token, user, status, navigate, refetch]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        {status === 'idle' || status === 'loading' ? (
          <>
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted text-sm">Accepting your invite…</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-bold text-ink text-lg">You've joined the family!</p>
            <p className="text-muted text-sm mt-1">Redirecting to your dashboard…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <p className="font-bold text-ink text-lg">Invite failed</p>
            <p className="text-muted text-sm mt-1">{message}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 text-accent text-sm font-semibold hover:underline"
            >
              Go home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
