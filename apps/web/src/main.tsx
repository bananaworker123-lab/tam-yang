import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { StoreProvider } from './mock/store';
import { LocaleProvider } from './i18n';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { LoginPage } from './routes/Login';
import { HomePage } from './routes/Home';
import { OnboardingPage } from './routes/Onboarding';
import { DashboardPage } from './routes/Dashboard';
import { AssignmentDetailPage } from './routes/AssignmentDetail';
import { ReportIssuePage } from './routes/ReportIssue';
import { RequestsPage } from './routes/Requests';
import { FamilyPage } from './routes/Family';
import { ProfilePage } from './routes/Profile';
import { TeacherPage } from './routes/Teacher';
import { AdminOverviewPage } from './routes/admin/Overview';
import { AdminAssignmentsPage } from './routes/admin/Assignments';
import { AdminProgressPage } from './routes/admin/Progress';
import { AdminRequestsPage } from './routes/admin/Requests';
import { AdminAuditPage } from './routes/admin/Audit';
import { AdminTeachersPage } from './routes/admin/Teachers';
import { AdminFamiliesPage } from './routes/admin/Families';
import { AdminSettingsPage } from './routes/admin/Settings';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <AuthProvider>
            <StoreProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/assignment/:id" element={<AssignmentDetailPage />} />
                    <Route path="/report" element={<ReportIssuePage />} />
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/family" element={<FamilyPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/teacher" element={<TeacherPage />} />
                    <Route path="/admin" element={<AdminOverviewPage />} />
                    <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
                    <Route path="/admin/progress" element={<AdminProgressPage />} />
                    <Route path="/admin/requests" element={<AdminRequestsPage />} />
                    <Route path="/admin/audit" element={<AdminAuditPage />} />
                    <Route path="/admin/teachers" element={<AdminTeachersPage />} />
                    <Route path="/admin/families" element={<AdminFamiliesPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </StoreProvider>
          </AuthProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
