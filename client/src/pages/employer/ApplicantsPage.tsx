import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api/client';

export const ApplicantsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'danger'; text: string } | null>(null);

  const fetchApplicants = async (jobId = initialJobId) => {
    setIsLoading(true);
    try {
      const url = jobId ? `/employer/applicants?jobId=${jobId}` : '/employer/applicants';
      const res = await apiRequest<{ applications: any[] }>(url);
      setApplications(res.applications || []);
      if (res.applications && res.applications.length > 0) {
        // Select first one by default
        selectApplicant(res.applications[0]);
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Error loading applicants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants(initialJobId);
  }, [initialJobId]);

  const selectApplicant = async (app: any) => {
    setSelectedApp(app);
    // If status is SUBMITTED, automatically transition to VIEWED
    if (app.status === 'SUBMITTED') {
      try {
        const res = await apiRequest<{ application: any }>(`/employer/applicants/${app.id}/view`, {
          method: 'POST'
        });
        // Update in list
        setApplications((prev) =>
          prev.map((item) => (item.id === app.id ? { ...item, status: 'VIEWED' } : item))
        );
        setSelectedApp((prev: any) => (prev && prev.id === app.id ? { ...prev, status: 'VIEWED' } : prev));
      } catch (err) {
        console.error('Error marking viewed:', err);
      }
    }
  };

  const handleUpdateStatus = async (status: 'SHORTLISTED' | 'REJECTED') => {
    if (!selectedApp) return;

    setIsUpdating(true);
    setFeedbackMsg(null);

    try {
      const res = await apiRequest<{ message: string; notification: any }>(
        `/employer/applicants/${selectedApp.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status })
        }
      );

      setFeedbackMsg({
        type: 'ok',
        text: `${res.message}. ${res.notification?.message || ''}`
      });

      // Update in local state
      setApplications((prev) =>
        prev.map((item) => (item.id === selectedApp.id ? { ...item, status } : item))
      );
      setSelectedApp((prev: any) => ({ ...prev, status }));
    } catch (err: any) {
      setFeedbackMsg({
        type: 'danger',
        text: err.message || 'Lỗi khi cập nhật trạng thái ứng viên'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderBadge = (status: string) => {
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
        <span>Chiến dịch tuyển dụng</span>
        <span className="ms">chevron_right</span>
        <span aria-current="page">
          {selectedApp ? selectedApp.job?.title : 'Quản lý ứng viên'}
        </span>
      </nav>

      <h1 className="page-title">
        Ứng viên ({applications.length} hồ sơ)
      </h1>

      {feedbackMsg && (
        <div className={`alert-banner alert-banner--${feedbackMsg.type}`}>
          <span className="ms">{feedbackMsg.type === 'ok' ? 'check_circle' : 'error'}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="empty-state">
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <p>Đang tải danh sách ứng viên...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <span className="ms">group_off</span>
          <h3>Chưa có ứng viên nào nộp hồ sơ</h3>
          <p>Khi sinh viên nộp đơn cho các tin tuyển dụng của bạn, danh sách hồ sơ sẽ xuất hiện tại đây.</p>
          <Link to="/employer/dashboard" className="btn btn--primary">
            Về bảng điều khiển
          </Link>
        </div>
      ) : (
        <div className="split">
          {/* Left Column: Applicants List */}
          <aside className="table-wrap">
            {applications.map((app) => {
              const isActive = selectedApp?.id === app.id;
              const initials =
                app.student?.fullName
                  ?.split(' ')
                  .map((w: string) => w[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase() || 'SV';

              return (
                <div
                  key={app.id}
                  className={`applicant ${isActive ? 'is-active' : ''}`}
                  onClick={() => selectApplicant(app)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="logo" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                    {initials}
                  </div>
                  <div>
                    <b>{app.student?.fullName || 'Sinh viên'}</b>
                    <small>{app.student?.university || 'Chưa cập nhật trường'}</small>
                  </div>
                  {renderBadge(app.status)}
                </div>
              );
            })}
          </aside>

          {/* Right Column: Applicant Details & PDF Preview */}
          {selectedApp && (
            <div className="stack">
              <section className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 className="card__title" style={{ marginBottom: '4px' }}>
                      {selectedApp.student?.fullName}
                    </h2>
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      Ứng tuyển: <strong>{selectedApp.job?.title}</strong>
                    </p>
                  </div>
                  {renderBadge(selectedApp.status)}
                </div>

                <div className="detail-meta">
                  <span>
                    Thời gian nộp: {new Date(selectedApp.createdAt).toLocaleString('vi-VN')}
                  </span>
                  <span>Email: {selectedApp.student?.user?.email}</span>
                  {selectedApp.resumeFileUrl && (
                    <a
                      href={selectedApp.resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--secondary)', fontWeight: 700 }}
                    >
                      Tải CV ({selectedApp.resumeFileUrl.endsWith('.pdf') ? 'PDF' : 'Tệp đính kèm'})
                    </a>
                  )}
                </div>

                {/* PDF In-browser Preview */}
                {selectedApp.resumeFileUrl ? (
                  selectedApp.resumeFileUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={selectedApp.resumeFileUrl}
                      title="Xem trước CV"
                      className="preview"
                      style={{ width: '100%', height: '480px', border: '1px solid var(--line)' }}
                    ></iframe>
                  ) : (
                    <div className="preview">
                      <div style={{ textAlign: 'center', padding: '24px' }}>
                        <span className="ms" style={{ fontSize: '36px', color: 'var(--primary)' }}>
                          description
                        </span>
                        <p style={{ marginTop: '8px' }}>
                          Tệp CV định dạng Word. Nhấn vào liên kết trên để tải về xem chi tiết.
                        </p>
                        <a
                          className="btn btn--outline btn--sm"
                          href={selectedApp.resumeFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginTop: '12px' }}
                        >
                          Tải xuống tệp CV
                        </a>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="preview">
                    <div style={{ textAlign: 'center' }}>
                      <span className="ms" style={{ fontSize: '36px', color: 'var(--soft)' }}>
                        account_circle
                      </span>
                      <p>Ứng viên sử dụng hồ sơ trực tuyến trên JobStudent.</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Kỹ năng: {selectedApp.student?.skills || 'Chưa cập nhật'} | Kinh nghiệm: {selectedApp.student?.experience || 'Chưa có'}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Cover Letter Section */}
              <section className="card">
                <h2 className="card__title">Thư giới thiệu</h2>
                <p className="quote">
                  {selectedApp.coverLetter || 'Ứng viên không đính kèm thư giới thiệu.'}
                </p>
              </section>

              {/* Action Buttons */}
              <div className="sticky-bar">
                <button
                  className="btn btn--danger"
                  type="button"
                  disabled={isUpdating || selectedApp.status === 'REJECTED'}
                  onClick={() => handleUpdateStatus('REJECTED')}
                >
                  <span className="ms">close</span>Từ chối
                </button>
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={isUpdating || selectedApp.status === 'SHORTLISTED'}
                  onClick={() => handleUpdateStatus('SHORTLISTED')}
                >
                  <span className="ms">check_circle</span>Đánh dấu Phù hợp
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
