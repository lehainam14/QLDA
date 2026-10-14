import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'ok' | 'danger'; text: string } | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ reports: any[] }>('/admin/reports');
      setReports(res.reports || []);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (id: string, action: 'HIDE_JOB' | 'DISMISS') => {
    try {
      const res = await apiRequest<{ message: string }>(`/admin/reports/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setMsg({ type: 'ok', text: res.message });
      fetchReports();
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.message || 'Lỗi khi xử lý báo cáo' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <main className="page">
      <h1 className="page-title">Báo cáo tin xấu</h1>

      {msg && (
        <div className={`alert-banner alert-banner--${msg.type}`}>
          <span className="ms">{msg.type === 'ok' ? 'check_circle' : 'error'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      <section className="card">
        <h2 className="card__title">Báo cáo mới ({reports.length} phản ánh)</h2>

        {isLoading ? (
          <div className="empty-state">
            <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p>Đang tải danh sách báo cáo...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <span className="ms">verified</span>
            <h3>Không có báo cáo tin xấu nào</h3>
            <p>Tất cả tin tuyển dụng hiện đang hoạt động bình thường và không có phản ánh vi phạm.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tin bị báo cáo</th>
                  <th>Lý do</th>
                  <th>Mô tả thêm</th>
                  <th>Người báo cáo</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <Link
                        to={`/jobs/${report.job?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                      >
                        {report.job?.title || 'Tin tuyển dụng'}
                      </Link>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>
                        {report.job?.employer?.companyName}
                      </small>
                    </td>
                    <td>
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                        {report.reason}
                      </span>
                    </td>
                    <td>{report.description || '—'}</td>
                    <td>{report.reporterEmail || 'Ẩn danh'}</td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      {report.status === 'PENDING' ? (
                        <span className="badge badge--warn">Chờ xử lý</span>
                      ) : report.status === 'RESOLVED' ? (
                        <span className="badge badge--ok">Đã ẩn tin</span>
                      ) : (
                        <span className="badge badge--muted">Đã bỏ qua</span>
                      )}
                    </td>
                    <td>
                      {report.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => handleAction(report.id, 'HIDE_JOB')}
                          >
                            Ẩn tin
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() => handleAction(report.id, 'DISMISS')}
                          >
                            Bỏ qua
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--soft)', fontSize: '12px' }}>Hoàn tất</span>
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
