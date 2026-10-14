import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = (location.state as any)?.from;

  const [role, setRole] = useState<'EMPLOYER' | 'STUDENT'>('EMPLOYER');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Employer state
  const [companyName, setCompanyName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // Student state
  const [fullname, setFullname] = useState('');
  const [university, setUniversity] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPassword, setStuPassword] = useState('');

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePasswordRule = (pwd: string) => {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
  };

  const validatePhoneRule = (p: string) => {
    return /^\d{10}$/.test(p);
  };

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) newErrors.companyName = 'Vui lòng nhập tên công ty / doanh nghiệp';
    if (!empEmail.trim()) newErrors.empEmail = 'Vui lòng nhập email doanh nghiệp';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empEmail.trim())) newErrors.empEmail = 'Email không hợp lệ';

    if (!empPassword) {
      newErrors.empPassword = 'Vui lòng nhập mật khẩu';
    } else if (!validatePasswordRule(empPassword)) {
      newErrors.empPassword = 'Mật khẩu tối thiểu 8 ký tự, có ít nhất một chữ hoa và một chữ số';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại người liên hệ';
    } else if (!validatePhoneRule(phone.trim())) {
      newErrors.phone = 'Số điện thoại phải gồm đúng 10 chữ số';
    }

    if (!taxId.trim()) newErrors.taxId = 'Vui lòng nhập mã số thuế';

    if (!licenseFile) {
      newErrors.licenseFile = 'Vui lòng tải lên tệp Giấy phép kinh doanh (JPG, PNG hoặc PDF)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGeneralError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('role', 'EMPLOYER');
      formData.append('company_name', companyName.trim());
      formData.append('email', empEmail.trim());
      formData.append('password', empPassword);
      formData.append('phone', phone.trim());
      formData.append('tax_id', taxId.trim());
      if (licenseFile) {
        formData.append('license_file', licenseFile);
      }

      const res = await apiRequest<{ token: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: formData
      });

      login(res.token, res.user);
      navigate('/employer/dashboard', { replace: true });
    } catch (err: any) {
      setGeneralError(err.message || 'Lỗi khi đăng ký tài khoản doanh nghiệp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullname.trim()) newErrors.fullname = 'Vui lòng nhập họ và tên';
    if (!university.trim()) newErrors.university = 'Vui lòng nhập trường đại học';
    if (!stuEmail.trim()) newErrors.stuEmail = 'Vui lòng nhập email sinh viên';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stuEmail.trim())) newErrors.stuEmail = 'Email không hợp lệ';

    if (!stuPassword) {
      newErrors.stuPassword = 'Vui lòng nhập mật khẩu';
    } else if (!validatePasswordRule(stuPassword)) {
      newErrors.stuPassword = 'Mật khẩu tối thiểu 8 ký tự, có ít nhất một chữ hoa và một chữ số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGeneralError('');
    setIsLoading(true);

    try {
      const res = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          role: 'STUDENT',
          fullname: fullname.trim(),
          university: university.trim(),
          email: stuEmail.trim(),
          password: stuPassword
        })
      });

      login(res.token, res.user);
      if (returnPath) {
        navigate(returnPath, { replace: true });
      } else {
        navigate('/student/profile', { replace: true });
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Lỗi khi đăng ký tài khoản sinh viên');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="auth">
        <section className="card">
          <h1 className="page-title">Tạo tài khoản</h1>

          {generalError && (
            <div className="alert-banner alert-banner--danger" style={{ marginBottom: '16px' }}>
              <span className="ms">error_outline</span>
              <span>{generalError}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div className="tabs">
            <label>
              <input
                type="radio"
                name="role"
                id="r-emp"
                checked={role === 'EMPLOYER'}
                onChange={() => {
                  setRole('EMPLOYER');
                  setErrors({});
                  setGeneralError('');
                }}
              />
              Nhà tuyển dụng
            </label>
            <label>
              <input
                type="radio"
                name="role"
                id="r-stu"
                checked={role === 'STUDENT'}
                onChange={() => {
                  setRole('STUDENT');
                  setErrors({});
                  setGeneralError('');
                }}
              />
              Sinh viên
            </label>
          </div>

          {/* Employer Form */}
          {role === 'EMPLOYER' && (
            <form id="form-emp" onSubmit={handleEmployerSubmit} noValidate>
              <div className="field">
                <label>
                  Tên công ty <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.companyName ? 'input--error' : ''}`}
                  type="text"
                  placeholder="Công ty CP / Cửa hàng / Doanh nghiệp..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>

              <div className="field">
                <label>
                  Email liên hệ <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.empEmail ? 'input--error' : ''}`}
                  type="email"
                  placeholder="tuyendung@congty.com"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                />
                {errors.empEmail && <span className="field-error">{errors.empEmail}</span>}
              </div>

              <div className="field">
                <label>
                  Mật khẩu <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.empPassword ? 'input--error' : ''}`}
                  type="password"
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa và chữ số"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                />
                <small>Tối thiểu 8 ký tự, ít nhất một chữ hoa và một chữ số.</small>
                {errors.empPassword && <span className="field-error">{errors.empPassword}</span>}
              </div>

              <div className="field">
                <label>
                  Số điện thoại người liên hệ <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.phone ? 'input--error' : ''}`}
                  type="tel"
                  placeholder="0901234567 (đúng 10 chữ số)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="field">
                <label>
                  Mã số thuế <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.taxId ? 'input--error' : ''}`}
                  type="text"
                  placeholder="0302829283"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
                {errors.taxId && <span className="field-error">{errors.taxId}</span>}
              </div>

              <div className="field">
                <label>
                  Tải lên Giấy phép kinh doanh (Ảnh/PDF) <span className="req">*</span>
                </label>
                <label className="file">
                  <span className="ms">upload_file</span>
                  <div>
                    <b>{licenseFile ? licenseFile.name : 'Chọn tệp từ máy'}</b>
                    <br />
                    <small>PDF, PNG, JPG (Tối đa 5MB)</small>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          setErrors((prev) => ({ ...prev, licenseFile: 'Dung lượng tệp vượt quá 5MB' }));
                          return;
                        }
                        setLicenseFile(file);
                        setErrors((prev) => ({ ...prev, licenseFile: '' }));
                      }
                    }}
                  />
                </label>
                {errors.licenseFile && <span className="field-error">{errors.licenseFile}</span>}
              </div>

              <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký Nhà tuyển dụng'}
              </button>
            </form>
          )}

          {/* Student Form */}
          {role === 'STUDENT' && (
            <form id="form-stu" onSubmit={handleStudentSubmit} noValidate>
              <div className="field">
                <label>
                  Họ và tên <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.fullname ? 'input--error' : ''}`}
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                {errors.fullname && <span className="field-error">{errors.fullname}</span>}
              </div>

              <div className="field">
                <label>
                  Trường đại học <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.university ? 'input--error' : ''}`}
                  type="text"
                  placeholder="ĐH Quốc Gia, ĐH Bách Khoa, UEH..."
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
                {errors.university && <span className="field-error">{errors.university}</span>}
              </div>

              <div className="field">
                <label>
                  Email <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.stuEmail ? 'input--error' : ''}`}
                  type="email"
                  placeholder="sinhvien@email.com"
                  value={stuEmail}
                  onChange={(e) => setStuEmail(e.target.value)}
                />
                {errors.stuEmail && <span className="field-error">{errors.stuEmail}</span>}
              </div>

              <div className="field">
                <label>
                  Mật khẩu <span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.stuPassword ? 'input--error' : ''}`}
                  type="password"
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa và chữ số"
                  value={stuPassword}
                  onChange={(e) => setStuPassword(e.target.value)}
                />
                <small>Tối thiểu 8 ký tự, ít nhất một chữ hoa và một chữ số.</small>
                {errors.stuPassword && <span className="field-error">{errors.stuPassword}</span>}
              </div>

              <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký Sinh viên'}
              </button>
            </form>
          )}

          <p className="auth__switch">
            Đã có tài khoản?{' '}
            <Link to="/login" state={{ from: returnPath }}>
              Chuyển sang Đăng nhập
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
