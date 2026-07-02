import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Entry point after login.
 * Routes: no user → /  |  no family → /onboarding  |  has family → /dashboard
 */
export function HomePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('/', { replace: true }); return; }
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
