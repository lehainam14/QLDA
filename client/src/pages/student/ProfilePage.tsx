import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullname, setFullname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [university, setUniversity] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [completionPercent, setCompletionPercent] = useState<number>(70);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    apiRequest<{ profile: any }>('/student/profile')
      .then((data) => {
        const p = data.profile;
        if (p) {
          setFullname(p.fullName || '');
          setBirthday(p.birthday || '');
          setUniversity(p.university || '');
          setSkills(p.skills || '');
          setExperience(p.experience || '');
          setCvUrl(p.cvUrl || null);
          setCompletionPercent(p.completionPercent || 70);
        }
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('birthday', birthday);
      formData.append('university', university);
      formData.append('skills', skills);
      formData.append('experience', experience);
      if (cvFile) {
        formData.append('cv_file', cvFile);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await apiRequest<{ message: string; profile: any }>('/student/profile', {
        method: 'PUT',
        body: formData
      });

      setSuccessMsg(res.message || 'Cập nhật hồ sơ thành công!');
      setCompletionPercent(res.profile.completionPercent);
      if (res.profile.cvUrl) {
        setCvUrl(res.profile.cvUrl);
      }
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <p>Đang tải hồ sơ sinh viên...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Trang chủ</Link>
        <span className="ms">chevron_right</span>
        <span aria-current="page">Hồ sơ của tôi</span>
      </nav>

      <h1 className="page-title">Hồ sơ cá nhân</h1>

      {successMsg && (
        <div className="alert-banner alert-banner--ok">
          <span className="ms">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-banner alert-banner--danger">
          <span className="ms">error_outline</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="split">
        {/* Profile Sidebar */}
        <aside className="card side-card">
          <div className="avatar">
            <span className="ms">person</span>
          </div>

          <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
            <span className="ms">photo_camera</span>
            {avatarFile ? 'Đã chọn ảnh' : 'Đổi ảnh đại diện'}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAvatarFile(e.target.files[0]);
                }
              }}
            />
          </label>

          <p className="apply__sub" style={{ marginTop: '16px' }}>
            Độ hoàn thiện hồ sơ: {completionPercent}%
          </p>
          <div className="progress">
            <i style={{ width: `${completionPercent}%` }}></i>
          </div>
        </aside>

        {/* Profile Details Form */}
        <form className="stack" onSubmit={handleUpdate}>
          <section className="card">
            <h2 className="card__title">Thông tin cơ bản</h2>
            <div className="form-grid">
              <div className="field">
                <label>
                  Họ tên <span className="req">*</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Lê Nguyễn Minh Anh"
                  required
                />
              </div>

              <div className="field">
                <label>
                  Ngày sinh <span className="req">*</span>
                </label>
                <input
                  className="input"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">Học vấn</h2>
            <div className="form-grid">
              <div className="field full">
                <label>
                  Tên Trường ĐH <span className="req">*</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="ĐH KHXH&NV, ĐH Bách Khoa, UEH..."
                  required
                />
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">Kỹ năng &amp; kinh nghiệm</h2>
            <div className="field">
              <label>
                Kỹ năng nổi bật <span className="req">*</span>
              </label>
              <input
                className="input"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Giao tiếp, Pha chế, POS, Tin học văn phòng..."
                required
              />
            </div>

            <div className="field">
              <label>
                Kinh nghiệm làm việc <span className="req">*</span>
              </label>
              <textarea
                className="input"
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Mô tả công việc bán thời gian, hoạt động ngoại khóa hoặc dự án đã từng tham gia..."
                required
              ></textarea>
            </div>

            <div className="field">
              <label>CV đính kèm</label>
              {cvUrl && (
                <div style={{ marginBottom: '8px' }}>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="ms">description</span>Xem tệp CV hiện tại
                  </a>
                </div>
              )}
              <label className="file">
                <span className="ms">upload_file</span>
                <div>
                  <b>{cvFile ? cvFile.name : 'Chọn tệp từ máy'}</b>
                  <br />
                  <small>PDF, DOC, DOCX (Tối đa 5MB)</small>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCvFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </section>

          <div className="sticky-bar">
            <button
              className="btn btn--outline"
              type="button"
              onClick={() => handleUpdate()}
              disabled={isSaving}
            >
              Lưu hồ sơ
            </button>
            <button className="btn btn--primary" type="submit" disabled={isSaving}>
              <span className="ms">check_circle</span>
              {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
