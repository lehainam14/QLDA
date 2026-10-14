import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const JobCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('Part-time');
  const [deadline, setDeadline] = useState('');
  const [wageMin, setWageMin] = useState('');
  const [wageMax, setWageMax] = useState('');
  const [wageType, setWageType] = useState('HOURLY');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load locations and categories
  useEffect(() => {
    apiRequest<{ locations?: any[]; cities?: any[] }>('/admin/locations?hierarchy=true')
      .then((data) => setCities(data.cities || data.locations || []))
      .catch(() => {});
    apiRequest<{ categories: any[] }>('/admin/categories')
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // If in edit mode, load existing job
  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      apiRequest<{ job: any }>(`/jobs/${editId}`)
        .then((data) => {
          const j = data.job;
          if (j) {
            setTitle(j.title || '');
            setJobType(j.jobType || 'Part-time');
            if (j.deadline) {
              setDeadline(new Date(j.deadline).toISOString().split('T')[0]);
            }
            setWageMin(j.wageMin ? j.wageMin.toString() : '');
            setWageMax(j.wageMax ? j.wageMax.toString() : '');
            setWageType(j.wageType || 'HOURLY');
            setAddress(j.address || '');
            setDescription(j.description || '');
            setRequirements(j.requirements || '');
            setBenefits(j.benefits || '');
            if (j.provinceId) setProvinceId(j.provinceId);
            if (j.districtId) setDistrictId(j.districtId);
            if (j.categoryId) setCategoryId(j.categoryId);
          }
        })
        .catch((err) => {
          setGeneralError(err.message || 'Không thể tải thông tin tin tuyển dụng để chỉnh sửa');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editId]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Vui lòng nhập tiêu đề công việc';
    } else if (title.trim().length > 100) {
      errs.title = `Tiêu đề không quá 100 ký tự (hiện tại: ${title.trim().length} ký tự)`;
    }

    if (!deadline) {
      errs.deadline = 'Vui lòng chọn hạn chót nhận hồ sơ';
    } else {
      const selected = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        errs.deadline = 'Hạn chót nhận hồ sơ phải sau ngày hiện tại';
      }
    }

    const min = Number(wageMin);
    const max = Number(wageMax);
    if (!wageMin || isNaN(min) || min < 0) {
      errs.wageMin = 'Mức lương từ phải là số dương';
    }
    if (!wageMax || isNaN(max) || max < 0) {
      errs.wageMax = 'Mức lương đến phải là số dương';
    }
    if (!isNaN(min) && !isNaN(max) && max < min) {
      errs.wageMax = 'Mức lương tối đa không được thấp hơn lương tối thiểu';
    }

    if (!address.trim()) {
      errs.address = 'Vui lòng nhập địa chỉ làm việc cụ thể';
    }

    if (!description.trim()) {
      errs.description = 'Vui lòng điền mô tả công việc';
    }

    if (!requirements.trim()) {
      errs.requirements = 'Vui lòng điền yêu cầu ứng viên';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (isDraft: boolean) => {
    if (!validate()) return;

    setGeneralError('');
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        job_type: jobType,
        deadline,
        wage_min: Number(wageMin),
        wage_max: Number(wageMax),
        wage_type: wageType,
        address: address.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        benefits: benefits.trim() || undefined,
        category_id: categoryId || undefined,
        province_id: provinceId || undefined,
        district_id: districtId || undefined,
        is_draft: isDraft
      };

      if (editId) {
        await apiRequest(`/employer/jobs/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/employer/jobs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      navigate('/employer/dashboard');
    } catch (err: any) {
      setGeneralError(err.message || 'Lỗi khi lưu tin tuyển dụng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="ms" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
          <p>Đang tải dữ liệu...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="crumbs">
        <span>Trang quản trị NTD</span>
        <span className="ms">chevron_right</span>
        <Link to="/employer/dashboard">Tin tuyển dụng</Link>
        <span className="ms">chevron_right</span>
        <span aria-current="page">{editId ? 'Sửa tin tuyển dụng' : 'Tạo tin mới'}</span>
      </nav>

      <h1 className="page-title">{editId ? 'Sửa tin tuyển dụng' : 'Tạo tin tuyển dụng'}</h1>

      {generalError && (
        <div className="alert-banner alert-banner--danger">
          <span className="ms">error_outline</span>
          <span>{generalError}</span>
        </div>
      )}

      {user?.employerProfile && !user.employerProfile.isVerified && (
        <div className="alert-banner alert-banner--warn">
          <span className="ms">info</span>
          <span>
            Tài khoản của bạn chưa được Admin phê duyệt. Bạn có thể lưu bản nháp hoặc chờ xét duyệt
            để đăng tin chính thức.
          </span>
        </div>
      )}

      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(false);
        }}
        noValidate
      >
        <section className="card">
          <h2 className="card__title">Thông tin cơ bản</h2>
          <div className="form-grid">
            <div className="field full">
              <label>
                Tiêu đề công việc <span className="req">*</span> <small>(Tối đa 100 ký tự)</small>
              </label>
              <input
                className={`input ${errors.title ? 'input--error' : ''}`}
                type="text"
                placeholder="Ví dụ: Nhân viên Pha chế / Phục vụ Ca Gãy"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="field">
              <label>
                Loại hình <span className="req">*</span>
              </label>
              <select
                className="input"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="Part-time">Part-time</option>
                <option value="Ca gãy">Ca gãy</option>
                <option value="Ca sáng">Ca sáng</option>
                <option value="Ca tối">Ca tối</option>
                <option value="Cuối tuần">Cuối tuần</option>
              </select>
            </div>

            <div className="field">
              <label>
                Hạn chót nhận hồ sơ <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.deadline ? 'input--error' : ''}`}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>

            <div className="field">
              <label>
                Mức lương từ (đ/giờ) <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.wageMin ? 'input--error' : ''}`}
                type="number"
                placeholder="30000"
                value={wageMin}
                onChange={(e) => setWageMin(e.target.value)}
              />
              {errors.wageMin && <span className="field-error">{errors.wageMin}</span>}
            </div>

            <div className="field">
              <label>
                Đến (đ/giờ) <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.wageMax ? 'input--error' : ''}`}
                type="number"
                placeholder="38000"
                value={wageMax}
                onChange={(e) => setWageMax(e.target.value)}
              />
              {errors.wageMax && <span className="field-error">{errors.wageMax}</span>}
            </div>

            <div className="field">
              <label>Lĩnh vực / Ngành nghề</label>
              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- Chọn ngành nghề --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Thành phố / Tỉnh</label>
              <select
                className="input"
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(e.target.value);
                  setDistrictId('');
                }}
              >
                <option value="">-- Chọn Thành phố / Tỉnh --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Quận / Huyện</label>
              <select
                className="input"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                disabled={!provinceId}
              >
                <option value="">-- Chọn Quận / Huyện --</option>
                {cities
                  .find((c) => c.id === provinceId)
                  ?.children?.map((dist: any) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="field full">
              <label>
                Địa chỉ chi tiết <span className="req">*</span>
              </label>
              <input
                className={`input ${errors.address ? 'input--error' : ''}`}
                type="text"
                placeholder="Số nhà, tên đường (ví dụ: 120 Cầu Giấy, Phường Quan Hoa)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Nội dung</h2>
          <div className="field">
            <label>
              Mô tả công việc <span className="req">*</span>
            </label>
            <textarea
              className={`input ${errors.description ? 'input--error' : ''}`}
              rows={4}
              placeholder="Liệt kê trách nhiệm chính trong ca làm việc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="field">
            <label>
              Yêu cầu ứng viên <span className="req">*</span>
            </label>
            <textarea
              className={`input ${errors.requirements ? 'input--error' : ''}`}
              rows={4}
              placeholder="Yêu cầu về đối tượng sinh viên, tính trung thực, thái độ làm việc..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            ></textarea>
            {errors.requirements && <span className="field-error">{errors.requirements}</span>}
          </div>

          <div className="field">
            <label>Chế độ phúc lợi</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Hỗ trợ tiền gửi xe, nước uống miễn phí, trả lương theo tuần, cấp mộc thực tập..."
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
            ></textarea>
          </div>
        </section>

        <div className="sticky-bar">
          <button
            className="btn btn--outline"
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <span className="ms">save</span>Lưu nháp
          </button>
          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            <span className="ms">send</span>
            {isSubmitting ? 'Đang gửi...' : 'Gửi chờ duyệt'}
          </button>
        </div>
      </form>
    </main>
  );
};
