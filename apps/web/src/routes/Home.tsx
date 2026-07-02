import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PENDING_INVITE_KEY } from './JoinFamily';

export function HomePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('/', { replace: true }); return; }

    // If user scanned a QR before logging in, resume the invite flow
    const pendingToken = localStorage.getItem(PENDING_INVITE_KEY);
    if (pendingToken) {
      localStorage.removeItem(PENDING_INVITE_KEY);
      navigate(`/join?token=${pendingToken}`, { replace: true });
      return;
    }

    if (!user.familyId && !user.roles.includes('admin') && !user.roles.includes('teacher')) {
      navigate('/onboarding', { replace: true });
    } else {
      const dest = user.roles.includes('admin') ? '/admin' :
                   user.roles.includes('teacher') ? '/teacher' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isLoading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}
