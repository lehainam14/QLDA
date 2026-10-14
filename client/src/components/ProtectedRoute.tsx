import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'EMPLOYER' | 'ADMIN')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
          Đang tải dữ liệu...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    // Preserve attempted path for return redirect
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <main className="page">
        <section className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Truy cập bị từ chối</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            Bạn không có quyền truy cập vào khu vực này.
          </p>
          <Navigate to="/" replace />
        </section>
      </main>
    );
  }

  return <>{children}</>;
};
