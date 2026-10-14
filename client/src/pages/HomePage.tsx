import React, { useState, useEffect, useCallback } from 'react';
import { JobCard } from '../components/JobCard';
import { Pagination } from '../components/Pagination';
import { apiRequest } from '../api/client';

export const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Search & Filter state
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [wageType, setWageType] = useState<string>('all'); // 'all', 'HOURLY', 'MONTHLY'
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch cities (with district children) & categories for filter options
  useEffect(() => {
    apiRequest<{ locations?: any[]; cities?: any[] }>('/admin/locations?hierarchy=true')
      .then((data) => {
        const list = data.cities || data.locations || [];
        setCities(list);
      })
      .catch((err) => console.error('Lỗi tải danh mục địa điểm:', err));

    apiRequest<{ categories: any[] }>('/admin/categories')
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error('Lỗi tải ngành nghề:', err));
  }, []);

  // Districts for currently selected city
  const currentCity = cities.find((c) => c.id === selectedProvinceId);
  const districtOptions = currentCity?.children || [];

  // Fetch jobs
  const fetchJobs = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', targetPage.toString());
        params.set('limit', '10');

        if (searchKeyword.trim()) params.set('q', searchKeyword.trim());
        if (selectedProvinceId) params.set('provinceId', selectedProvinceId);
        if (selectedDistrictId) params.set('districtId', selectedDistrictId);
        if (wageType !== 'all') params.set('wageType', wageType);
        if (selectedShifts.length > 0) params.set('shifts', selectedShifts.join(','));
        if (selectedCategories.length === 1) {
          params.set('category', selectedCategories[0]);
        }

        const res = await apiRequest<{ jobs: any[]; pagination: any }>(`/jobs?${params.toString()}`);
        setJobs(res.jobs || []);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error loading jobs:', err);
        setJobs([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchKeyword, selectedProvinceId, selectedDistrictId, wageType, selectedShifts, selectedCategories]
  );

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword === keywordInput.trim()) {
      fetchJobs(1);
    } else {
      setSearchKeyword(keywordInput.trim());
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(''); // Reset district when city changes
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
  };

  const handleShiftChange = (shift: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    setSearchKeyword('');
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setWageType('all');
    setSelectedShifts([]);
    setSelectedCategories([]);
    setPage(1);
  };

  const isFilterActive =
    Boolean(searchKeyword) ||
    Boolean(keywordInput) ||
    Boolean(selectedProvinceId) ||
    Boolean(selectedDistrictId) ||
    wageType !== 'all' ||
    selectedShifts.length > 0 ||
    selectedCategories.length > 0;

  return (
    <main className="page">
      {/* Omni-search Bar: Ô tìm tên/kỹ năng chiếm phần lớn (flex: 1), 2 ô địa điểm thu nhỏ gọn (searchbar__select) */}
      <form className="searchbar" role="search" onSubmit={handleSearchSubmit}>
        <input
          className="input"
          type="search"
          placeholder="Tên công việc, kỹ năng, tên công ty..."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />

        <select
          className="input searchbar__select"
          aria-label="Chọn Thành phố/Tỉnh"
          value={selectedProvinceId}
          onChange={(e) => handleProvinceChange(e.target.value)}
          title="Chọn Thành phố / Tỉnh"
        >
          <option value="">Tất cả Tỉnh/TP</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          className="input searchbar__select"
          aria-label="Chọn Quận/Huyện"
          value={selectedDistrictId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedProvinceId}
          title={selectedProvinceId ? 'Chọn Quận / Huyện' : 'Vui lòng chọn Tỉnh/TP trước'}
        >
          <option value="">Tất cả Quận/Huyện</option>
          {districtOptions.map((dist: any) => (
            <option key={dist.id} value={dist.id}>
              {dist.name}
            </option>
          ))}
        </select>

        <button className="btn btn--primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
          <span className="ms">search</span>Tìm việc
        </button>
      </form>

      <div className="split">
        {/* Filter Panel */}
        <aside className="card filter" aria-label="Bộ lọc nâng cao">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card__title" style={{ margin: 0 }}>
              Bộ lọc
            </h2>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn--outline btn--sm"
                style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
              >
                Xóa lọc
              </button>
            )}
          </div>

          <h3>Địa điểm</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <select
              className="input"
              aria-label="Lọc theo Thành phố/Tỉnh"
              value={selectedProvinceId}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">Tất cả Thành phố/Tỉnh</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            <select
              className="input"
              aria-label="Lọc theo Quận/Huyện"
              value={selectedDistrictId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvinceId}
            >
              <option value="">Tất cả Quận/Huyện</option>
              {districtOptions.map((dist: any) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <h3>Mức lương</h3>
          <label>
            <input
              type="radio"
              name="w"
              checked={wageType === 'all'}
              onChange={() => setWageType('all')}
            />
            Tất cả
          </label>
          <label>
            <input
              type="radio"
              name="w"
              checked={wageType === 'HOURLY'}
              onChange={() => setWageType('HOURLY')}
            />
            Theo giờ
          </label>
          <label>
            <input
              type="radio"
              name="w"
              checked={wageType === 'MONTHLY'}
              onChange={() => setWageType('MONTHLY')}
            />
            Theo tháng
          </label>

          <h3>Khung giờ làm việc</h3>
          {['Ca sáng', 'Ca gãy', 'Cuối tuần'].map((shift) => (
            <label key={shift}>
              <input
                type="checkbox"
                checked={selectedShifts.includes(shift)}
                onChange={() => handleShiftChange(shift)}
              />
              {shift}
            </label>
          ))}

          <h3>Lĩnh vực</h3>
          {categories.length > 0
            ? categories.map((cat) => (
                <label key={cat.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => handleCategoryChange(cat.name)}
                  />
                  {cat.name}
                </label>
              ))
            : ['F&B', 'Gia sư', 'Kho vận', 'Bán lẻ & CSKH', 'Văn phòng', 'Sáng tạo nội dung'].map((cat) => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  {cat}
                </label>
              ))}
        </aside>

        {/* Job Listings Column */}
        <div className="stack">
          {/* Safety Notice Banner */}
          <aside className="safety" role="note">
            <span className="ms fill">shield</span>
            <p>
              <strong>Không đóng bất kỳ khoản phí đặt cọc nào khi nhận việc.</strong> Báo cáo ngay nếu gặp tin tuyển dụng thu phí.
            </p>
          </aside>

          {/* Loading State */}
          {isLoading ? (
            <div className="empty-state">
              <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
                progress_activity
              </span>
              <p>Đang tìm kiếm việc làm phù hợp...</p>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <span className="ms">search_off</span>
              <h3>Không tìm thấy công việc phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa hoặc điều chỉnh các tiêu chí bộ lọc để có kết quả tốt hơn.</p>
              <button className="btn btn--primary" type="button" onClick={handleClearFilters}>
                <span className="ms">refresh</span>Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '8px', color: 'var(--muted)', fontSize: '13px' }}>
                Tìm thấy <strong>{total}</strong> việc làm phù hợp
              </div>
              <div className="cards">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => fetchJobs(p)}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
};
