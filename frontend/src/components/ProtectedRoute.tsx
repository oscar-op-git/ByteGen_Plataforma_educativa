import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../services/authService';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean; 
};

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // se obtiene la sesión del usuario con cache
    getSession()
      .then((data) => {
        if (mounted) setSession(data);
      })
      .catch(() => {
        if (mounted) setSession(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        Cargando...
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !session.user.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}