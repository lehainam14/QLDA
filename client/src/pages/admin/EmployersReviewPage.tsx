import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';

export const EmployersReviewPage: React.FC = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'danger'; text: string } | null>(null);

  const fetchEmployers = async () => {
    setIsLoading(true);
    try {
      const url = search.trim() ? `/admin/employers?q=${encodeURIComponent(search.trim())}` : '/admin/employers';
      const res = await apiRequest<{ employers: any[] }>(url);
      setEmployers(res.employers || []);
    } catch (err: any) {
      console.error('Error fetching employers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, [search]);

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await apiRequest<{ message: string; employer: any }>(`/admin/employers/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setActionMsg({ type: 'ok', text: res.message });
      fetchEmployers();
    } catch (err: any) {
      setActionMsg({ type: 'danger', text: err.message || 'Lỗi khi cập nhật' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <main className="page">
      <h1 className="page-title">Duyệt tài khoản nhà tuyển dụng</h1>

      {actionMsg && (
        <div className={`alert-banner alert-banner--${actionMsg.type}`}>
          <span className="ms">{actionMsg.type === 'ok' ? 'check_circle' : 'error'}</span>
          <span>{actionMsg.text}</span>
        </div>
      )}

      <section className="card">
        <h2 className="card__title">Danh sách doanh nghiệp</h2>
        <div className="admin-tools">
          <input
            className="input"
            type="search"
            placeholder="Tìm theo tên công ty, MST, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="empty-state">
            <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p>Đang tải danh sách nhà tuyển dụng...</p>
          </div>
        ) : employers.length === 0 ? (
          <div className="empty-state">
            <span className="ms">check</span>
            <p>Không có nhà tuyển dụng nào phù hợp với tìm kiếm.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Công ty</th>
                  <th>Mã số thuế</th>
                  <th>Giấy phép KD</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <b>{emp.companyName}</b>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>
                        {emp.user?.email} • SĐT: {emp.phone}
                      </small>
                    </td>
                    <td>{emp.taxId}</td>
                    <td>
                      {emp.licenseFileUrl ? (
                        <a
                          href={emp.licenseFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="ms">description</span>Xem tệp
                        </a>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>Chưa có tệp</span>
                      )}
                    </td>
                    <td>{formatDate(emp.createdAt)}</td>
                    <td>
                      {emp.isVerified ? (
                        <span className="badge badge--ok">Đã duyệt</span>
                      ) : emp.verificationStatus === 'REJECTED' ? (
                        <span className="badge badge--danger">Từ chối</span>
                      ) : (
                        <span className="badge badge--warn">Chờ duyệt</span>
                      )}
                    </td>
                    <td>
                      {!emp.isVerified ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleReview(emp.id, 'APPROVE')}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => handleReview(emp.id, 'REJECT')}
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => handleReview(emp.id, 'REJECT')}
                        >
                          Hủy duyệt
                        </button>
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
