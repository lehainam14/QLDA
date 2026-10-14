import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export const DemoNavigator: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [firstJobId, setFirstJobId] = useState<string>('seed-job-1');

  useEffect(() => {
    apiRequest<{ jobs: any[] }>('/jobs?limit=1')
      .then((res) => {
        if (res.jobs && res.jobs.length > 0) {
          setFirstJobId(res.jobs[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const quickLogin = async (email: string, targetPath?: string) => {
    try {
      const res = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'Password123' })
      });
      login(res.token, res.user);
      if (targetPath) {
        navigate(targetPath);
      }
    } catch (err: any) {
      alert('Lỗi đăng nhập nhanh: ' + err.message);
    }
  };

  return (
    <details
      className="demo-bar"
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary>
        <span className="ms">explore</span>Demo ({isAuthenticated ? user?.role : 'Khách'})
      </summary>

      <div className="demo-bar__content">
        {/* Quick Account Switcher Bar */}
        <div style={{ gridColumn: '1 / -1', paddingBottom: '12px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>
            ⚡ Đăng nhập nhanh 1 chạm:
          </span>
          <button
            type="button"
            className={`btn btn--sm ${user?.role === 'STUDENT' ? 'btn--primary' : 'btn--outline'}`}
            style={{ height: '28px', padding: '0 10px', fontSize: '12px' }}
            onClick={() => quickLogin('sinhvien@jobstudent.vn', '/student/profile')}
          >
            Sinh viên
          </button>
          <button
            type="button"
            className={`btn btn--sm ${user?.role === 'EMPLOYER' ? 'btn--primary' : 'btn--outline'}`}
            style={{ height: '28px', padding: '0 10px', fontSize: '12px' }}
            onClick={() => quickLogin('highlands@jobstudent.vn', '/employer/dashboard')}
          >
            Nhà tuyển dụng
          </button>
          <button
            type="button"
            className={`btn btn--sm ${user?.role === 'ADMIN' ? 'btn--primary' : 'btn--outline'}`}
            style={{ height: '28px', padding: '0 10px', fontSize: '12px' }}
            onClick={() => quickLogin('admin@jobstudent.vn', '/admin/employers')}
          >
            Admin
          </button>
          {isAuthenticated && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              style={{ height: '28px', padding: '0 10px', fontSize: '12px', color: 'var(--danger)' }}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Đăng xuất
            </button>
          )}
        </div>

        {/* Group 1: Khách */}
        <div className="demo-bar__group">
          <h4>Khách</h4>
          <Link to="/">Trang chủ &amp; Tìm việc</Link>
          <Link to={`/jobs/${firstJobId}`}>Chi tiết việc &amp; Ứng tuyển</Link>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký tài khoản</Link>
        </div>

        {/* Group 2: Sinh viên */}
        <div className="demo-bar__group">
          <h4>Sinh viên</h4>
          <span
            onClick={() => {
              if (user?.role !== 'STUDENT') {
                quickLogin('sinhvien@jobstudent.vn', '/student/profile');
              } else {
                navigate('/student/profile');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/student/profile">Hồ sơ cá nhân</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'STUDENT') {
                quickLogin('sinhvien@jobstudent.vn', '/student/applications');
              } else {
                navigate('/student/applications');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/student/applications">Theo dõi ứng tuyển</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'STUDENT') {
                quickLogin('sinhvien@jobstudent.vn', '/student/saved-jobs');
              } else {
                navigate('/student/saved-jobs');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/student/saved-jobs">Việc làm đã lưu</Link>
          </span>
        </div>

        {/* Group 3: Nhà tuyển dụng */}
        <div className="demo-bar__group">
          <h4>Nhà tuyển dụng</h4>
          <span
            onClick={() => {
              if (user?.role !== 'EMPLOYER') {
                quickLogin('highlands@jobstudent.vn', '/employer/dashboard');
              } else {
                navigate('/employer/dashboard');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/employer/dashboard">Bảng điều khiển</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'EMPLOYER') {
                quickLogin('highlands@jobstudent.vn', '/employer/job-create');
              } else {
                navigate('/employer/job-create');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/employer/job-create">Đăng tin tuyển dụng</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'EMPLOYER') {
                quickLogin('highlands@jobstudent.vn', '/employer/applicants');
              } else {
                navigate('/employer/applicants');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/employer/applicants">Quản lý ứng viên</Link>
          </span>
        </div>

        {/* Group 4: Admin */}
        <div className="demo-bar__group">
          <h4>Admin</h4>
          <span
            onClick={() => {
              if (user?.role !== 'ADMIN') {
                quickLogin('admin@jobstudent.vn', '/admin/employers');
              } else {
                navigate('/admin/employers');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/admin/employers">Duyệt NTD</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'ADMIN') {
                quickLogin('admin@jobstudent.vn', '/admin/jobs');
              } else {
                navigate('/admin/jobs');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/admin/jobs">Duyệt tin đăng</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'ADMIN') {
                quickLogin('admin@jobstudent.vn', '/admin/reports');
              } else {
                navigate('/admin/reports');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/admin/reports">Xử lý báo cáo xấu</Link>
          </span>
          <span
            onClick={() => {
              if (user?.role !== 'ADMIN') {
                quickLogin('admin@jobstudent.vn', '/admin/categories');
              } else {
                navigate('/admin/categories');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Link to="/admin/categories">Quản lý danh mục</Link>
          </span>
        </div>
      </div>
    </details>
  );
};
