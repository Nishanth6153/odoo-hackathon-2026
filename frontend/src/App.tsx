import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { EmployeePage } from './pages/EmployeePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { MyAttendancePage } from './pages/MyAttendancePage';
import { AttendancePage } from './pages/AttendancePage';
import { MyTimeOffPage } from './pages/MyTimeOffPage';
import { TimeOffManagementPage } from './pages/TimeOffManagementPage';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN' || user.role === 'HR') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'EMPLOYEE') {
    return <Navigate to="/employee" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin & HR Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/time-off"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <TimeOffManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/time-off"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyTimeOffPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
