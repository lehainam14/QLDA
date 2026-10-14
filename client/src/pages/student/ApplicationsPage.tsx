import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    apiRequest<{ applications: any[] }>('/student/applications')
      .then((data) => setApplications(data.applications || []))
      .catch((err) => console.error('Error fetching applications:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="badge badge--info">Đã nộp</span>;
      case 'VIEWED':
        return <span className="badge badge--warn">Đã xem</span>;
      case 'SHORTLISTED':
        return <span className="badge badge--ok">Phù hợp</span>;
      case 'REJECTED':
        return <span className="badge badge--danger">Từ chối</span>;
      default:
        return <span className="badge badge--muted">{status}</span>;
    }
  };

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Trang chủ</Link>
        <span className="ms">chevron_right</span>
        <span aria-current="page">Ứng tuyển của tôi</span>
      </nav>

      <h1 className="page-title">Theo dõi ứng tuyển</h1>

      <section className="card">
        <h2 className="card__title">Danh sách đã nộp</h2>

        {isLoading ? (
          <div className="empty-state">
            <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p>Đang tải danh sách đơn ứng tuyển...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <span className="ms">description</span>
            <h3>Bạn chưa nộp đơn ứng tuyển nào</h3>
            <p>Khám phá các việc làm phù hợp và nộp hồ sơ trực tuyến ngay hôm nay.</p>
            <Link to="/" className="btn btn--primary">
              Tìm việc làm
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Vị trí</th>
                  <th>Công ty</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link
                        to={`/jobs/${app.job.id}`}
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                      >
                        {app.job.title}
                      </Link>
                    </td>
                    <td>{app.job.employer?.companyName}</td>
                    <td>{formatDate(app.createdAt)}</td>
                    <td>{renderStatusBadge(app.status)}</td>
                    <td>
                      <Link className="btn btn--outline btn--sm" to={`/jobs/${app.job.id}`}>
                        Xem tin
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
