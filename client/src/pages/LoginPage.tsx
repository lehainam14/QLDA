import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Return path from location state
  const returnPath = (location.state as any)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });

      login(res.token, res.user);

      // Redirect back to intended page or default role route
      if (returnPath) {
        navigate(returnPath, { replace: true });
      } else if (res.user.role === 'EMPLOYER') {
        navigate('/employer/dashboard', { replace: true });
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin/employers', { replace: true });
      } else {
        navigate('/student/profile', { replace: true });
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Email hoặc mật khẩu không chính xác' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="auth">
        <section className="card">
          <h1 className="page-title">Đăng nhập</h1>

          {returnPath && (
            <div className="alert-banner alert-banner--warn" style={{ marginBottom: '16px' }}>
              <span className="ms">info</span>
              <span>Vui lòng đăng nhập để tiếp tục thao tác bạn vừa chọn.</span>
            </div>
          )}

          {errors.general && (
            <div className="alert-banner alert-banner--danger" style={{ marginBottom: '16px' }}>
              <span className="ms">error_outline</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">
                Email <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.email ? 'input--error' : ''}`}
                type="email"
                id="email"
                name="email"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="password">
                Mật khẩu <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.password ? 'input--error' : ''}`}
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="divider">hoặc</div>

          <button
            type="button"
            className="btn btn--outline btn--block"
            onClick={() => alert('Đăng nhập Google SSO (Cần cấu hình OAuth Client ID trong môi trường thực tế)')}
          >
            Tiếp tục với Google
          </button>
          <button
            type="button"
            className="btn btn--outline btn--block"
            style={{ marginTop: '8px' }}
            onClick={() => alert('Đăng nhập Facebook SSO (Cần cấu hình Facebook App ID trong môi trường thực tế)')}
          >
            Tiếp tục với Facebook
          </button>

          <p className="auth__switch">
            Chưa có tài khoản?{' '}
            <Link to="/register" state={{ from: returnPath }}>
              Đăng ký
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
