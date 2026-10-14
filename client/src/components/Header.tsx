import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isStudent, isEmployer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          <img src="/assets/img/logo.svg" alt="JobStudent" width="32" height="32" />
          JobStudent
        </Link>

        <nav className="nav" aria-label="Menu chính">
          {/* Default / Guest navigation */}
          {!isAuthenticated && (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Tìm việc làm
              </NavLink>
              <a href="/#nearby">Việc làm quanh đây</a>
              <a href="/#cv">Mẫu CV</a>
              <a href="/#pricing">Bảng giá (Dành cho NTD)</a>
            </>
          )}

          {/* Student navigation */}
          {isAuthenticated && isStudent && (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Tìm việc làm
              </NavLink>
              <NavLink to="/student/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Hồ sơ của tôi
              </NavLink>
              <NavLink to="/student/applications" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Ứng tuyển của tôi
              </NavLink>
              <NavLink to="/student/saved-jobs" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Việc làm đã lưu
              </NavLink>
            </>
          )}

          {/* Employer navigation */}
          {isAuthenticated && isEmployer && (
            <>
              <NavLink to="/employer/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Quản lý tuyển dụng
              </NavLink>
              <NavLink to="/employer/job-create" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Đăng tin
              </NavLink>
              <NavLink to="/employer/applicants" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Ứng viên
              </NavLink>
            </>
          )}

          {/* Admin navigation */}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink to="/admin/employers" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Duyệt NTD
              </NavLink>
              <NavLink to="/admin/jobs" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Duyệt tin
              </NavLink>
              <NavLink to="/admin/reports" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Báo cáo
              </NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Danh mục
              </NavLink>
            </>
          )}
        </nav>

        <div className="header__actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn--outline btn--sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <span className="chip">
                <span className="ms">person</span>
                {isStudent && (user?.studentProfile?.fullName || 'Sinh viên')}
                {isEmployer && (user?.employerProfile?.companyName || 'Nhà tuyển dụng')}
                {isAdmin && 'Quản trị viên'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn--outline btn--sm"
                title="Đăng xuất khỏi tài khoản"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
