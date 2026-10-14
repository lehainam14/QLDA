import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

export const JobsReviewPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'danger'; text: string } | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ jobs: any[] }>('/admin/jobs');
      setJobs(res.jobs || []);
    } catch (err: any) {
      console.error('Error fetching pending jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApprove = async (jobId: string) => {
    try {
      const res = await apiRequest<{ message: string }>(`/admin/jobs/${jobId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action: 'APPROVE' })
      });
      setActionMsg({ type: 'ok', text: res.message });
      fetchJobs();
    } catch (err: any) {
      setActionMsg({ type: 'danger', text: err.message || 'Lỗi khi duyệt tin' });
    }
  };

  const handleReject = async (jobId: string) => {
    const reason = rejectReasons[jobId];
    if (!reason || !reason.trim()) {
      alert('Vui lòng nhập lý do từ chối để nhà tuyển dụng có thể sửa lại tin.');
      return;
    }

    try {
      const res = await apiRequest<{ message: string }>(`/admin/jobs/${jobId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'REJECT',
          rejectReason: reason.trim()
        })
      });
      setActionMsg({ type: 'ok', text: res.message });
      fetchJobs();
    } catch (err: any) {
      setActionMsg({ type: 'danger', text: err.message || 'Lỗi khi từ chối tin' });
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <main className="page">
      <h1 className="page-title">Duyệt tin tuyển dụng</h1>

      {actionMsg && (
        <div className={`alert-banner alert-banner--${actionMsg.type}`}>
          <span className="ms">{actionMsg.type === 'ok' ? 'check_circle' : 'error'}</span>
          <span>{actionMsg.text}</span>
        </div>
      )}

      <section className="card">
        <h2 className="card__title">Tin chờ duyệt ({jobs.length} tin)</h2>

        {isLoading ? (
          <div className="empty-state">
            <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p>Đang tải danh sách tin chờ duyệt...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span className="ms">done_all</span>
            <h3>Hiện không có tin tuyển dụng nào cần duyệt</h3>
            <p>Tất cả tin đăng từ các nhà tuyển dụng đã được xử lý.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Công ty</th>
                  <th>Gửi lúc</th>
                  <th>Trạng thái</th>
                  <th>Lý do từ chối (bắt buộc khi từ chối)</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link
                        to={`/jobs/${job.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                      >
                        {job.title}
                      </Link>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>
                        Lương: {new Intl.NumberFormat('vi-VN').format(job.wageMin)}đ - {new Intl.NumberFormat('vi-VN').format(job.wageMax)}đ/{job.wageType === 'MONTHLY' ? 'tháng' : 'giờ'}
                      </small>
                    </td>
                    <td>{job.employer?.companyName}</td>
                    <td>{getTimeAgo(job.createdAt)}</td>
                    <td>
                      <span className="badge badge--warn">Chờ duyệt</span>
                    </td>
                    <td style={{ minWidth: '220px' }}>
                      <input
                        className="input"
                        placeholder="Nhập lý do từ chối nếu không duyệt..."
                        value={rejectReasons[job.id] || ''}
                        onChange={(e) =>
                          setRejectReasons((prev) => ({
                            ...prev,
                            [job.id]: e.target.value
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => handleApprove(job.id)}
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleReject(job.id)}
                      >
                        Từ chối
                      </button>
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
