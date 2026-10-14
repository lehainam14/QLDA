import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { SavedJobsPage } from './pages/student/SavedJobsPage';
import { ApplicationsPage } from './pages/student/ApplicationsPage';
import { DashboardPage } from './pages/employer/DashboardPage';
import { JobCreatePage } from './pages/employer/JobCreatePage';
import { ApplicantsPage } from './pages/employer/ApplicantsPage';
import { EmployersReviewPage } from './pages/admin/EmployersReviewPage';
import { JobsReviewPage } from './pages/admin/JobsReviewPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { ReportsPage } from './pages/admin/ReportsPage';

export const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Public & Auth */}
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Area */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />

        {/* Employer Area */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/job-create"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <JobCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applicants"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Area */}
        <Route
          path="/admin/employers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EmployersReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <JobsReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Backward Compatibility Redirects */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/register.html" element={<Navigate to="/register" replace />} />
        <Route path="/student/profile.html" element={<Navigate to="/student/profile" replace />} />
        <Route path="/student/saved-jobs.html" element={<Navigate to="/student/saved-jobs" replace />} />
        <Route path="/student/applications.html" element={<Navigate to="/student/applications" replace />} />
        <Route path="/employer/dashboard.html" element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="/employer/job-create.html" element={<Navigate to="/employer/job-create" replace />} />
        <Route path="/employer/applicants.html" element={<Navigate to="/employer/applicants" replace />} />
        <Route path="/admin/employers-review.html" element={<Navigate to="/admin/employers" replace />} />
        <Route path="/admin/jobs-review.html" element={<Navigate to="/admin/jobs" replace />} />
        <Route path="/admin/categories.html" element={<Navigate to="/admin/categories" replace />} />
        <Route path="/admin/reports.html" element={<Navigate to="/admin/reports" replace />} />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
