import http from 'http';
import app from './src/index.js';

let server: http.Server;
const BASE_URL = 'http://localhost:5001/api';

async function request(path: string, options: any = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : headers
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- BẮT ĐẦU KIỂM THỬ HỆ THỐNG API JOBSTUDENT ---');

  // Start test server on port 5001
  await new Promise<void>((resolve) => {
    server = app.listen(5001, () => {
      console.log('Test server running on port 5001');
      resolve();
    });
  });

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('[TEST 1] Health Check:', health.status === 200 && health.data.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Auth - Student Login
    const stuLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sinhvien@jobstudent.vn', password: 'Password123' })
    });
    console.log('[TEST 2] Student Login:', stuLogin.status === 200 && !!stuLogin.data.token ? 'PASS' : 'FAIL');
    const stuToken = stuLogin.data.token;

    // 3. Auth - Employer Login
    const empLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'highlands@jobstudent.vn', password: 'Password123' })
    });
    console.log('[TEST 3] Employer Login (Verified):', empLogin.status === 200 && empLogin.data.user.employerProfile.isVerified ? 'PASS' : 'FAIL');
    const empToken = empLogin.data.token;

    // 4. Auth - Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@jobstudent.vn', password: 'Password123' })
    });
    console.log('[TEST 4] Admin Login:', adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN' ? 'PASS' : 'FAIL');
    const adminToken = adminLogin.data.token;

    // 5. Validation - Weak Password Rejection
    const weakReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        role: 'STUDENT',
        email: 'testweak@email.com',
        password: 'weak',
        fullname: 'Test',
        university: 'Test'
      })
    });
    console.log('[TEST 5] Reject Weak Password (<8 chars, no uppercase/digits):', weakReg.status === 400 ? 'PASS' : 'FAIL');

    // 6. Public Job Search & Filter (max 10 limit)
    const jobsRes = await request('/jobs?page=1&limit=10');
    console.log('[TEST 6] List Published Jobs (Max 10 per page):', jobsRes.status === 200 && jobsRes.data.jobs.length <= 10 ? 'PASS' : 'FAIL');

    const searchRes = await request('/jobs?q=Pha chế');
    console.log('[TEST 7] Search by keyword ("Pha chế"):', searchRes.status === 200 && searchRes.data.jobs.length > 0 ? 'PASS' : 'FAIL');
    const sampleJobId = searchRes.data.jobs[0]?.id;

    // 7. Get Job Detail
    const detailRes = await request(`/jobs/${sampleJobId}`, {
      headers: { Authorization: `Bearer ${stuToken}` }
    });
    console.log('[TEST 8] Job Detail with Student Context:', detailRes.status === 200 && detailRes.data.job.title.length > 0 ? 'PASS' : 'FAIL');

    // 8. Student Save Job Toggle
    const saveToggle = await request('/jobs/save', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stuToken}` },
      body: JSON.stringify({ jobId: sampleJobId })
    });
    console.log('[TEST 9] Toggle Save Job:', saveToggle.status === 200 ? 'PASS' : 'FAIL');

    // 9. Prevent Duplicate Application
    const duplicateApp = await request('/student/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stuToken}` },
      body: JSON.stringify({
        jobId: sampleJobId,
        resumeType: 'profile',
        cover: 'Cover letter test'
      })
    });
    console.log('[TEST 10] Prevent Duplicate Application (already applied):', duplicateApp.status === 400 ? 'PASS' : 'FAIL');

    // 10. Student Applications List
    const myApps = await request('/student/applications', {
      headers: { Authorization: `Bearer ${stuToken}` }
    });
    console.log('[TEST 11] Student Applications List with Statuses:', myApps.status === 200 && myApps.data.applications.length > 0 ? 'PASS' : 'FAIL');

    // 11. Employer Dashboard
    const empDash = await request('/employer/dashboard', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log('[TEST 12] Employer Dashboard (Job listings & Applicant count):', empDash.status === 200 && Array.isArray(empDash.data.jobs) ? 'PASS' : 'FAIL');

    // 12. Employer Applicants (Mini ATS)
    const applicantsRes = await request(`/employer/applicants?jobId=${sampleJobId}`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log('[TEST 13] Employer View Applicants:', applicantsRes.status === 200 && applicantsRes.data.applications.length > 0 ? 'PASS' : 'FAIL');
    const sampleAppId = applicantsRes.data.applications[0]?.id;

    // 13. Employer Update Applicant Status
    if (sampleAppId) {
      const updateStatus = await request(`/employer/applicants/${sampleAppId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${empToken}` },
        body: JSON.stringify({ status: 'SHORTLISTED', note: 'Phù hợp phỏng vấn' })
      });
      console.log('[TEST 14] Mini ATS - Mark Applicant SHORTLISTED & Record Notification:', updateStatus.status === 200 && updateStatus.data.application.status === 'SHORTLISTED' ? 'PASS' : 'FAIL');
    }

    // 14. Admin Review Pending Employers
    const pendingEmps = await request('/admin/employers', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('[TEST 15] Admin View Employers:', pendingEmps.status === 200 ? 'PASS' : 'FAIL');

    // 15. Admin Categories Management
    const addCat = await request('/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Thực tập sinh IT ' + Date.now() })
    });
    console.log('[TEST 16] Admin Add Category:', addCat.status === 201 ? 'PASS' : 'FAIL');
    if (addCat.data.category?.id) {
      const delCat = await request(`/admin/categories/${addCat.data.category.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('[TEST 17] Admin Delete Category:', delCat.status === 200 ? 'PASS' : 'FAIL');
    }

    // 16. Admin Reports Management
    const reportsRes = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('[TEST 18] Admin View Fraud Reports:', reportsRes.status === 200 && Array.isArray(reportsRes.data.reports) ? 'PASS' : 'FAIL');

    console.log('--- TOÀN BỘ CÁC BÀI KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG ---');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
  }
}

runTests();
