import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { UserDashboard } from '../pages/UserDashboard';
import { Profile } from '../pages/Profile';
import { MyLeaves } from '../pages/MyLeaves';
import { Holidays } from '../pages/Holidays';
import { TimeTracker } from '../pages/TimeTracker';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { LeaveManagement } from '../pages/admin/LeaveManagement';
import { HolidayManagement } from '../pages/admin/HolidayManagement';
import { Reports } from '../pages/admin/Reports';
import { RoleBasedDashboard } from '../components/RoleBasedDashboard';
import { Settings } from '../pages/admin/Settings';

export const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <RoleBasedDashboard /> : <Login />} 
        />

        {/* Role-based Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Layout>
                <MyLeaves />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays"
          element={
            <ProtectedRoute>
              <Layout>
                <Holidays />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <Layout>
                <TimeTracker />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <LeaveManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/holidays"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <HolidayManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};