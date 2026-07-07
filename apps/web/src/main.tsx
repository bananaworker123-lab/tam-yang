import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { LocaleProvider } from './i18n';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Eagerly loaded (always needed on first paint)
import { LoginPage } from './routes/Login';
import { HomePage } from './routes/Home';

// Lazy loaded — split into separate chunks, loaded on demand
const OnboardingPage       = lazy(() => import('./routes/Onboarding').then(m => ({ default: m.OnboardingPage })));
const JoinFamilyPage       = lazy(() => import('./routes/JoinFamily').then(m => ({ default: m.JoinFamilyPage })));
const DashboardPage        = lazy(() => import('./routes/Dashboard').then(m => ({ default: m.DashboardPage })));
const AssignmentDetailPage = lazy(() => import('./routes/AssignmentDetail').then(m => ({ default: m.AssignmentDetailPage })));
const ReportIssuePage      = lazy(() => import('./routes/ReportIssue').then(m => ({ default: m.ReportIssuePage })));
const RequestsPage         = lazy(() => import('./routes/Requests').then(m => ({ default: m.RequestsPage })));
const ProfilePage          = lazy(() => import('./routes/Profile').then(m => ({ default: m.ProfilePage })));
const TeacherPage          = lazy(() => import('./routes/Teacher').then(m => ({ default: m.TeacherPage })));
const AdminOverviewPage    = lazy(() => import('./routes/admin/Overview').then(m => ({ default: m.AdminOverviewPage })));
const AdminAssignmentsPage = lazy(() => import('./routes/admin/Assignments').then(m => ({ default: m.AdminAssignmentsPage })));
const AdminProgressPage    = lazy(() => import('./routes/admin/Progress').then(m => ({ default: m.AdminProgressPage })));
const AdminRequestsPage    = lazy(() => import('./routes/admin/Requests').then(m => ({ default: m.AdminRequestsPage })));
const AdminAuditPage       = lazy(() => import('./routes/admin/Audit').then(m => ({ default: m.AdminAuditPage })));
const AdminTeachersPage    = lazy(() => import('./routes/admin/Teachers').then(m => ({ default: m.AdminTeachersPage })));
const AdminFamiliesPage    = lazy(() => import('./routes/admin/Families').then(m => ({ default: m.AdminFamiliesPage })));
const ExamSchedulePage     = lazy(() => import('./routes/ExamSchedule').then(m => ({ default: m.ExamSchedulePage })));
const AdminExamSchedulePage = lazy(() => import('./routes/admin/ExamSchedule').then(m => ({ default: m.AdminExamSchedulePage })));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5 minutes — avoids refetch on every nav
      gcTime:    1000 * 60 * 10,  // keep cache 10 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <AuthProvider>
              <BrowserRouter>
                <Suspense fallback={<PageSpinner />}>
                  <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/join" element={<JoinFamilyPage />} />
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/exam" element={<ExamSchedulePage />} />
                      <Route path="/assignment/:id" element={<AssignmentDetailPage />} />
                      <Route path="/report" element={<ReportIssuePage />} />
                      <Route path="/requests" element={<RequestsPage />} />
                      <Route path="/family" element={<Navigate to="/profile" replace />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/teacher" element={<TeacherPage />} />
                      <Route path="/admin" element={<AdminOverviewPage />} />
                      <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
                      <Route path="/admin/progress" element={<AdminProgressPage />} />
                      <Route path="/admin/requests" element={<AdminRequestsPage />} />
                      <Route path="/admin/audit" element={<AdminAuditPage />} />
                      <Route path="/admin/exam" element={<AdminExamSchedulePage />} />
                      <Route path="/admin/teachers" element={<AdminTeachersPage />} />
                      <Route path="/admin/families" element={<AdminFamiliesPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
          </AuthProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
