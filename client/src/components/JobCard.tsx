import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    jobType?: string;
    shiftTypes?: string | null;
    wageMin: number;
    wageMax: number;
    wageType?: string;
    address: string;
    formattedLocation?: string;
    province?: { id?: string; name: string } | null;
    district?: { id?: string; name: string } | null;
    createdAt: string;
    isSaved?: boolean;
    hasApplied?: boolean;
    employer?: {
      companyName: string;
      isVerified?: boolean;
    };
    location?: {
      name: string;
    } | null;
  };
  onSaveToggle?: (jobId: string, saved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSaveToggle }) => {
  const { isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaved, setIsSaved] = useState<boolean>(job.isSaved || false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const formatWage = (min: number, max: number, type?: string) => {
    const formattedMin = new Intl.NumberFormat('vi-VN').format(min);
    const formattedMax = new Intl.NumberFormat('vi-VN').format(max);
    const unit = type === 'MONTHLY' ? 'tháng' : 'giờ';
    return `${formattedMin}đ - ${formattedMax}đ/${unit}`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 3600) {
      const mins = Math.max(1, Math.floor(diff / 60));
      return `Đăng ${mins} phút trước`;
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `Đăng ${hours} giờ trước`;
    }
    const days = Math.floor(diff / 86400);
    return `Đăng ${days} ngày trước`;
  };

  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      // Save current path and redirect to login
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
      if (onSaveToggle) {
        onSaveToggle(job.id, res.saved);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu tin');
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = job.employer?.companyName?.charAt(0)?.toUpperCase() || 'J';
  const displayLocation =
    job.formattedLocation ||
    (job.district && job.province
      ? `${job.district.name}, ${job.province.name}`
      : (job.district?.name || job.province?.name || job.location?.name || job.address));

  return (
    <article className="jobcard">
      <div className="jobcard__head">
        <div className="logo">{initialLetter}</div>
        <p className="jobcard__co">
          {job.employer?.companyName || 'Doanh nghiệp'}
          {job.employer?.isVerified && (
            <span className="ms fill" title="Doanh nghiệp đã xác thực">
              verified
            </span>
          )}
        </p>
        <button
          className="iconbtn"
          type="button"
          aria-label={isSaved ? 'Bỏ lưu tin' : 'Lưu tin'}
          onClick={handleBookmarkClick}
          disabled={isSaving}
          title={isSaved ? 'Đã lưu' : 'Lưu tin'}
        >
          <span className={`ms ${isSaved ? 'fill' : ''}`} style={isSaved ? { color: 'var(--amber)' } : undefined}>
            bookmark
          </span>
        </button>
      </div>

      <h3 className="jobcard__title">
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>

      <div className="chips">
        <span className="chip chip--wage">{formatWage(job.wageMin, job.wageMax, job.wageType)}</span>
        <span className="chip chip--shift">{job.jobType || job.shiftTypes || 'Part-time'}</span>
        <span className="chip">
          <span className="ms">pin_drop</span>
          {displayLocation}
        </span>
      </div>

      <div className="jobcard__foot">
        <span>{getTimeAgo(job.createdAt)}</span>
        <div>
          <Link className="btn btn--outline btn--sm" to={`/jobs/${job.id}`}>
            Xem chi tiết
          </Link>
          {job.hasApplied ? (
            <button className="btn btn--secondary btn--sm" disabled>
              Đã ứng tuyển
            </button>
          ) : (
            <Link className="btn btn--primary btn--sm" to={`/jobs/${job.id}#apply`}>
              Ứng tuyển
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
