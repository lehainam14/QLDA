import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JobCard } from '../../components/JobCard';
import { apiRequest } from '../../api/client';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ savedJobs: any[] }>('/jobs/saved');
      setSavedJobs(res.savedJobs || []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (jobId: string, saved: boolean) => {
    if (!saved) {
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
    }
  };

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Trang chủ</Link>
        <span className="ms">chevron_right</span>
        <span aria-current="page">Việc làm đã lưu</span>
      </nav>

      <h1 className="page-title">Việc làm đã lưu</h1>

      {isLoading ? (
        <div className="empty-state">
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <p>Đang tải danh sách việc làm đã lưu...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="empty-state">
          <span className="ms">bookmark_border</span>
          <h3>Chưa có việc làm nào được lưu</h3>
          <p>Hãy dạo quanh danh sách việc làm và bấm biểu tượng bookmark để lưu lại các tin bạn yêu thích.</p>
          <Link to="/" className="btn btn--primary">
            Tìm việc làm ngay
          </Link>
        </div>
      ) : (
        <div className="cards">
          {savedJobs.map((item) => (
            <JobCard
              key={item.id}
              job={{ ...item.job, isSaved: true }}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
};
