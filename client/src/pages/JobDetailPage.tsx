import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Apply form state
  const [resumeType, setResumeType] = useState<'profile' | 'upload'>('profile');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [applyError, setApplyError] = useState<string>('');
  const [applySuccess, setApplySuccess] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Report form state
  const [reportReason, setReportReason] = useState<string>('Thu phí đặt cọc, phí hồ sơ');
  const [reportNote, setReportNote] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string>('');
  const [reportError, setReportError] = useState<string>('');
  const [isReporting, setIsReporting] = useState<boolean>(false);

  // Bookmark state
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchJobDetail = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ job: any }>(`/jobs/${id}`);
      setJob(res.job);
      setIsSaved(res.job.isSaved || false);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin công việc');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetail();
    // Check if URL hash is #apply
    if (window.location.hash === '#apply') {
      setIsApplyModalOpen(true);
    }
  }, [id]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + '#apply' } });
      return;
    }
    if (!isStudent) {
      alert('Chỉ tài khoản sinh viên mới có thể nộp đơn ứng tuyển');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + '#report' } });
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!isStudent) {
      alert('Chỉ tài khoản sinh viên mới có thể lưu việc làm');
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiRequest<{ saved: boolean }>('/jobs/save', {
        method: 'POST',
        body: JSON.stringify({ jobId: job.id })
      });
      setIsSaved(res.saved);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    // Validation: cover letter word count <= 500 words
    if (coverLetter.trim()) {
      const words = coverLetter.trim().split(/\s+/).filter(Boolean).length;
      if (words > 500) {
        setApplyError(`Thư giới thiệu không được vượt quá 500 từ (hiện tại: ${words} từ).`);
        return;
      }
    }

    // Validation: if upload resume chosen, must have file
    if (resumeType === 'upload' && !resumeFile) {
      setApplyError('Vui lòng chọn tệp CV từ máy tính định dạng PDF hoặc Word (tối đa 5MB).');
      return;
    }

    try {
      setIsApplying(true);
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('resumeType', resumeType);
      formData.append('cover', coverLetter);
      if (resumeFile) {
        formData.append('cv_file', resumeFile);
      }

      await apiRequest('/student/apply', {
        method: 'POST',
        body: formData
      });

      setApplySuccess('Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
      setJob((prev: any) => ({ ...prev, hasApplied: true }));
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess('');
      }, 2000);
    } catch (err: any) {
      setApplyError(err.message || 'Lỗi khi nộp hồ sơ ứng tuyển');
    } finally {
      setIsApplying(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');

    try {
      setIsReporting(true);
      await apiRequest('/jobs/report', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job.id,
          reason: reportReason,
          description: reportNote
        })
      });

      setReportSuccess('Báo cáo của bạn đã được ghi nhận. Quản trị viên sẽ xử lý trong thời gian sớm nhất.');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess('');
      }, 2000);
    } catch (err: any) {
      setReportError(err.message || 'Lỗi khi gửi báo cáo');
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Đã sao chép liên kết vào bộ nhớ tạm!');
  };

  if (isLoading) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <p>Đang tải chi tiết công việc...</p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="ms">error_outline</span>
          <h3>{error || 'Không tìm thấy thông tin công việc'}</h3>
          <Link to="/" className="btn btn--primary">
            Quay lại trang tìm việc
          </Link>
        </div>
      </main>
    );
  }

  const formatWage = (min: number, max: number, type?: string) => {
    const formattedMin = new Intl.NumberFormat('vi-VN').format(min);
    const formattedMax = new Intl.NumberFormat('vi-VN').format(max);
    const unit = type === 'MONTHLY' ? 'tháng' : 'giờ';
    return `${formattedMin}đ - ${formattedMax}đ/${unit}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const initialLetter = job.employer?.companyName?.charAt(0)?.toUpperCase() || 'J';
  const displayLocation =
    job.formattedLocation ||
    (job.district && job.province
      ? `${job.district.name}, ${job.province.name}`
      : (job.district?.name || job.province?.name || job.location?.name || job.address));

  return (
    <main className="page">
      {/* Breadcrumb */}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="ms">chevron_right</span>
        <Link to="/">Tìm việc làm</Link>
        <span className="ms">chevron_right</span>
        <span aria-current="page">{job.title}</span>
      </nav>

      <div className="grid">
        <div className="stack">
          {/* Main Job Info Card */}
          <section className="card">
            <div className="job__top">
              <div className="logo" aria-hidden="true">
                {initialLetter}
              </div>
              <div>
                <p className="job__company">
                  {job.employer?.companyName}
                  {job.employer?.isVerified && (
                    <span className="ms fill" title="Doanh nghiệp đã xác thực MST">
                      verified
                    </span>
                  )}
                </p>
                <h1 className="job__title">{job.title}</h1>
                <div className="chips">
                  <span className="chip chip--wage">
                    <span className="ms">payments</span>
                    {formatWage(job.wageMin, job.wageMax, job.wageType)}
                  </span>
                  <span className="chip chip--shift">
                    <span className="ms">calendar_month</span>
                    {job.jobType || job.shiftTypes || 'Part-time'}
                  </span>
                  <span className="chip">
                    <span className="ms">pin_drop</span>
                    {displayLocation}
                  </span>
                </div>
              </div>
            </div>

            <div className="job__meta">
              <span className="badge badge--ok">
                <span className="ms fill" style={{ fontSize: '14px' }}>
                  shield
                </span>
                Đã xác thực GPKD
              </span>
              <span className="badge badge--info">Hỗ trợ xoay ca mùa thi</span>
              <span className="badge badge--warn">Cần người gấp</span>
            </div>
          </section>

          {/* Safety Banner */}
          <aside className="safety" role="note">
            <span className="ms fill">shield</span>
            <p>
              <strong>Không đóng bất kỳ khoản phí đặt cọc nào khi nhận việc.</strong> Tuyệt đối không nộp tiền hồ sơ,
              tiền đồng phục hay giao căn cước gốc trước khi đi làm.
            </p>
            <button className="btn btn--danger btn--sm" type="button" onClick={handleReportClick}>
              <span className="ms">flag</span>Báo cáo tin xấu
            </button>
          </aside>

          {/* Job Description */}
          <section className="card">
            <h2 className="card__title">Mô tả công việc</h2>
            <div className="prose" style={{ whiteSpace: 'pre-line' }}>
              {job.description}
            </div>
          </section>

          {/* Candidate Requirements */}
          <section className="card">
            <h2 className="card__title">Yêu cầu ứng viên</h2>
            <div className="prose" style={{ whiteSpace: 'pre-line' }}>
              {job.requirements}
            </div>
          </section>

          {/* Benefits */}
          <section className="card">
            <h2 className="card__title">Chế độ phúc lợi</h2>
            {job.benefits ? (
              <div className="prose" style={{ whiteSpace: 'pre-line' }}>
                {job.benefits}
              </div>
            ) : (
              <ul className="perks">
                <li className="perk">
                  <span className="ms">calendar_view_week</span>Trả lương theo tuần, thứ 6 hàng tuần
                </li>
                <li className="perk">
                  <span className="ms">two_wheeler</span>Hỗ trợ 100% tiền gửi xe
                </li>
                <li className="perk">
                  <span className="ms">local_cafe</span>Nước uống miễn phí mỗi ca
                </li>
                <li className="perk">
                  <span className="ms">workspace_premium</span>Cấp dấu mộc thực tập
                </li>
              </ul>
            )}
          </section>

          {/* Work Location & Map */}
          <section className="card">
            <h2 className="card__title">Địa điểm làm việc</h2>
            <iframe
              className="map"
              title="Bản đồ địa điểm làm việc"
              loading="lazy"
              src={
                job.mapUrl ||
                `https://www.google.com/maps?q=${encodeURIComponent(job.address)}&output=embed`
              }
            ></iframe>
            <p className="addr">
              <span>
                <span className="ms">pin_drop</span>
                {job.address}
              </span>
              <a
                className="btn btn--secondary btn--sm"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ms">directions</span>Chỉ đường
              </a>
            </p>
          </section>
        </div>

        {/* Right Sticky Sidebar */}
        <aside className="aside">
          <section className="card">
            <p className="apply__wage">{formatWage(job.wageMin, job.wageMax, job.wageType)}</p>
            <p className="apply__sub">Nhận lương theo tuần</p>

            <div className="actions">
              {job.hasApplied ? (
                <button className="btn btn--secondary btn--block" disabled>
                  <span className="ms">check_circle</span>Đã ứng tuyển
                </button>
              ) : (
                <button className="btn btn--primary btn--block" type="button" onClick={handleApplyClick}>
                  <span className="ms">send</span>Ứng tuyển ngay
                </button>
              )}

              <div className="actions__row">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={handleBookmarkClick}
                  disabled={isSaving}
                >
                  <span className={`ms ${isSaved ? 'fill' : ''}`} style={isSaved ? { color: 'var(--amber)' } : undefined}>
                    bookmark
                  </span>
                  {isSaved ? 'Đã lưu' : 'Lưu tin'}
                </button>
                <button className="btn btn--outline" type="button" onClick={handleShare}>
                  <span className="ms">share</span>Chia sẻ
                </button>
              </div>
            </div>

            <ul className="facts">
              <li>
                <span>Loại hình</span>
                <span>{job.jobType || job.shiftTypes || 'Part-time'}</span>
              </li>
              <li>
                <span>Hạn nộp hồ sơ</span>
                <span>{formatDate(job.deadline)}</span>
              </li>
              <li>
                <span>Trạng thái</span>
                <span style={{ color: 'var(--ok)' }}>Đang tuyển</span>
              </li>
            </ul>

            <p className="report">
              <button
                type="button"
                onClick={handleReportClick}
                style={{ background: 'none', border: 0, color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
              >
                <span className="ms" style={{ fontSize: '16px' }}>
                  flag
                </span>
                Báo cáo tin xấu cho quản trị viên
              </button>
            </p>
          </section>
        </aside>
      </div>

      {/* QUICK APPLY MODAL */}
      {isApplyModalOpen && (
        <div className="modal is-active" role="dialog" aria-modal="true" aria-labelledby="apply-title">
          <div className="modal__back" onClick={() => setIsApplyModalOpen(false)}></div>
          <form className="modal__box" onSubmit={handleApplySubmit}>
            <div className="modal__head">
              <div>
                <h2 id="apply-title">Ứng tuyển nhanh</h2>
                <p>
                  {job.title} • {job.employer?.companyName}
                </p>
              </div>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setIsApplyModalOpen(false)}
                aria-label="Đóng"
              >
                <span className="ms">close</span>
              </button>
            </div>

            {applySuccess && (
              <div className="alert-banner alert-banner--ok">
                <span className="ms">check_circle</span>
                <span>{applySuccess}</span>
              </div>
            )}

            <fieldset className="field">
              <legend>
                Chọn hồ sơ gửi đi <span className="req">*</span>
              </legend>
              <label className="opt">
                <input
                  type="radio"
                  name="cv"
                  value="profile"
                  checked={resumeType === 'profile'}
                  onChange={() => setResumeType('profile')}
                />
                <div>
                  <b>Hồ sơ của tôi trên JobStudent</b>
                  <span>
                    {user?.studentProfile?.fullName || 'Hồ sơ cá nhân'} • Đã cập nhật
                  </span>
                </div>
              </label>

              <label className="opt">
                <input
                  type="radio"
                  name="cv"
                  value="upload"
                  checked={resumeType === 'upload'}
                  onChange={() => setResumeType('upload')}
                />
                <div>
                  <b>Tải lên CV mới</b>
                  <span>PDF hoặc Word, tối đa 5MB</span>
                </div>
              </label>

              {resumeType === 'upload' && (
                <label className="file" style={{ marginTop: '8px' }}>
                  <span className="ms">upload_file</span>
                  <div>
                    <b>{resumeFile ? resumeFile.name : 'Chọn tệp CV từ máy'}</b>
                    <br />
                    <small>PDF, DOC, DOCX (Tối đa 5MB)</small>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          setApplyError('Tệp tải lên vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.');
                          return;
                        }
                        setResumeFile(file);
                        setApplyError('');
                      }
                    }}
                  />
                </label>
              )}
            </fieldset>

            <div className="field">
              <label htmlFor="cover">
                Thư giới thiệu <small>(Tối đa 500 từ)</small>
              </label>
              <textarea
                className={`input ${applyError && applyError.includes('Thư giới thiệu') ? 'input--error' : ''}`}
                id="cover"
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Giới thiệu ngắn về bản thân, lịch học và ca làm bạn có thể nhận..."
              ></textarea>
              <small>Không ghi số thẻ ngân hàng hay mật khẩu vào thư giới thiệu.</small>
              {applyError && <span className="field-error">{applyError}</span>}
            </div>

            <div className="modal__foot">
              <button
                className="btn btn--outline"
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Hủy
              </button>
              <button className="btn btn--primary" type="submit" disabled={isApplying}>
                <span className="ms">send</span>
                {isApplying ? 'Đang gửi...' : 'Gửi hồ sơ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="modal is-active" role="dialog" aria-modal="true" aria-labelledby="report-title">
          <div className="modal__back" onClick={() => setIsReportModalOpen(false)}></div>
          <form className="modal__box" onSubmit={handleReportSubmit}>
            <div className="modal__head">
              <div>
                <h2 id="report-title">Báo cáo tin xấu</h2>
                <p>Quản trị viên sẽ kiểm tra tin này trong thời gian sớm nhất.</p>
              </div>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setIsReportModalOpen(false)}
                aria-label="Đóng"
              >
                <span className="ms">close</span>
              </button>
            </div>

            {reportSuccess && (
              <div className="alert-banner alert-banner--ok">
                <span className="ms">check_circle</span>
                <span>{reportSuccess}</span>
              </div>
            )}

            <fieldset className="field">
              <legend>
                Lý do báo cáo <span className="req">*</span>
              </legend>
              {[
                'Thu phí đặt cọc, phí hồ sơ',
                'Dấu hiệu đa cấp hoặc lừa đảo',
                'Thông tin lương, địa chỉ không đúng'
              ].map((reason) => (
                <label className="opt" key={reason}>
                  <input
                    type="radio"
                    name="reason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                  />
                  <div>
                    <b>{reason}</b>
                  </div>
                </label>
              ))}
            </fieldset>

            <div className="field">
              <label htmlFor="note">Mô tả thêm</label>
              <textarea
                className="input"
                id="note"
                rows={3}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Cung cấp thêm chi tiết về vi phạm để quản trị viên xử lý nhanh chóng..."
              ></textarea>
              {reportError && <span className="field-error">{reportError}</span>}
            </div>

            <div className="modal__foot">
              <button
                className="btn btn--outline"
                type="button"
                onClick={() => setIsReportModalOpen(false)}
              >
                Hủy
              </button>
              <button className="btn btn--danger" type="submit" disabled={isReporting}>
                <span className="ms">flag</span>
                {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
