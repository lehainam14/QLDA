import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

export const DashboardPage: React.FC = () => {
  const [employer, setEmployer] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    apiRequest<{ employer: any; jobs: any[] }>('/employer/dashboard')
      .then((data) => {
        setEmployer(data.employer);
        setJobs(data.jobs || []);
      })
      .catch((err) => console.error('Error fetching dashboard:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const renderStatusBadge = (status: string, rejectReason?: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge--ok">Đang hiển thị</span>;
      case 'PENDING':
        return <span className="badge badge--warn">Chờ duyệt</span>;
      case 'DRAFT':
        return <span className="badge badge--muted">Nháp</span>;
      case 'REJECTED':
        return (
          <>
            <span className="badge badge--danger">Từ chối</span>
            {rejectReason && (
              <>
                <br />
                <small style={{ color: 'var(--danger)' }}>Lý do: {rejectReason}</small>
              </>
            )}
          </>
        );
      case 'EXPIRED':
        return <span className="badge badge--muted">Hết hạn</span>;
      default:
        return <span className="badge badge--muted">{status}</span>;
    }
  };

  return (
    <main className="page">
      <nav className="crumbs">
        <span>Trang quản trị NTD</span>
        <span className="ms">chevron_right</span>
        <span aria-current="page">Tin tuyển dụng</span>
      </nav>

      {/* Account Verification Banner */}
      {employer && !employer.isVerified && (
        <div className="alert-banner alert-banner--warn">
          <span className="ms">verified_user</span>
          <div>
            <strong>Tài khoản doanh nghiệp đang chờ duyệt:</strong> Giấy phép kinh doanh của công ty{' '}
            <em>{employer.companyName}</em> đang được Quản trị viên đối chiếu và xác thực. Chức năng
            đăng tin mới sẽ tự động kích hoạt sau khi được phê duyệt.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Tin tuyển dụng
        </h1>
        <Link
          className={`btn btn--primary ${employer && !employer.isVerified ? 'btn--disabled' : ''}`}
          to="/employer/job-create"
        >
          <span className="ms">add</span>Đăng tin mới
        </Link>
      </div>

      <section className="card">
        <h2 className="card__title">Tất cả tin</h2>

        {isLoading ? (
          <div className="empty-state">
            <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p>Đang tải danh sách tin tuyển dụng...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span className="ms">post_add</span>
            <h3>Chưa có tin tuyển dụng nào</h3>
            <p>Hãy bắt đầu tạo tin tuyển dụng đầu tiên để tiếp cận ứng viên sinh viên tiềm năng.</p>
            {employer?.isVerified && (
              <Link to="/employer/job-create" className="btn btn--primary">
                Đăng tin tuyển dụng ngay
              </Link>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Hạn nộp</th>
                  <th>Hồ sơ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link
                        to={`/jobs/${job.id}`}
                        style={{ color: 'var(--ink)', fontWeight: 700 }}
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td>{formatDate(job.deadline)}</td>
                    <td>
                      <b>{job.applicantCount || 0}</b>
                    </td>
                    <td>{renderStatusBadge(job.displayStatus, job.rejectReason)}</td>
                    <td>
                      {job.applicantCount > 0 ? (
                        <Link
                          className="btn btn--secondary btn--sm"
                          to={`/employer/applicants?jobId=${job.id}`}
                        >
                          <span className="ms">group</span>Ứng viên
                        </Link>
                      ) : null}

                      {(job.status === 'DRAFT' || job.status === 'REJECTED') && (
                        <Link
                          className="btn btn--outline btn--sm"
                          to={`/employer/job-create?editId=${job.id}`}
                        >
                          <span className="ms">edit</span>Sửa
                        </Link>
                      )}
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
