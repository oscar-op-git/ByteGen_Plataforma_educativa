import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../services/authService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
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

  return <>{children}</>;
}